package com.sheets.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FormulaService {

    private static final Logger log = LoggerFactory.getLogger(FormulaService.class);

    public String evaluate(String formula, Map<String, String> cellValues) {
        return evaluate(formula, cellValues, null);
    }

    public String evaluate(String formula, Map<String, String> cellValues, Map<String, Map<String, String>> allSheetCells) {
        try {
            java.io.FileWriter fw = new java.io.FileWriter("/tmp/formula_debug.txt", true);
            fw.write("[FORMULA EVAL] formula=" + formula + " cellValues=" + cellValues + "\n");
            fw.close();
        } catch (Exception e) { /* ignore */ }
        if (formula == null || formula.isEmpty()) return "";
        if (!formula.startsWith("=")) return formula;
        try {
            String expr = formula.substring(1).trim();
            List<String> tokens = tokenize(expr);
            Parser parser = new Parser(tokens, cellValues, allSheetCells);
            double result = parser.parseExpression();
            return formatNumber(result);
        } catch (DivByZeroException e) {
            return "#DIV/0!";
        } catch (ValueException e) {
            log.error("[FORMULA] ValueException: {}", e.getMessage());
            return "#VALUE!";
        } catch (NameException e) {
            log.error("[FORMULA] NameException: {}", e.getMessage());
            return "#NAME?";
        } catch (Exception e) {
            log.error("[FORMULA] Unexpected: {} - {}", e.getClass().getName(), e.getMessage());
            return "#VALUE!";
        }
    }

    private List<String> tokenize(String expr) {
        List<String> tokens = new ArrayList<>();
        int i = 0;
        while (i < expr.length()) {
            char c = expr.charAt(i);
            if (Character.isWhitespace(c)) { i++; continue; }
            if (c == '(') { tokens.add("("); i++; continue; }
            if (c == ')') { tokens.add(")"); i++; continue; }
            if (c == ',') { tokens.add(","); i++; continue; }
            if (c == '+' || c == '-' || c == '*' || c == '/') { tokens.add(String.valueOf(c)); i++; continue; }
            if (c == '"') {
                i++;
                StringBuilder sb = new StringBuilder();
                while (i < expr.length() && expr.charAt(i) != '"') { sb.append(expr.charAt(i)); i++; }
                if (i < expr.length()) i++;
                tokens.add(sb.toString());
                continue;
            }
            StringBuilder sb = new StringBuilder();
            while (i < expr.length()) {
                char ch = expr.charAt(i);
                if (Character.isLetterOrDigit(ch) || ch == '.' || ch == ':' || ch == '!') {
                    sb.append(ch);
                    i++;
                } else break;
            }
            if (sb.length() > 0) tokens.add(sb.toString());
        }
        return tokens;
    }

    private class Parser {
        private final List<String> tokens;
        private int pos;
        private final Map<String, String> cellValues;
        private final Map<String, Map<String, String>> allSheetCells;

        Parser(List<String> tokens, Map<String, String> cellValues, Map<String, Map<String, String>> allSheetCells) {
            this.tokens = tokens;
            this.pos = 0;
            this.cellValues = cellValues;
            this.allSheetCells = allSheetCells;
        }

        String peek() { return pos < tokens.size() ? tokens.get(pos) : null; }
        String next() { return pos < tokens.size() ? tokens.get(pos++) : null; }
        boolean hasNext() { return pos < tokens.size(); }

        double parseExpression() { return parseAddition(); }

        double parseAddition() {
            double left = parseMultiplication();
            while (hasNext()) {
                String op = peek();
                if (op.equals("+") || op.equals("-")) {
                    next();
                    double right = parseMultiplication();
                    if (op.equals("+")) left += right;
                    else left -= right;
                } else break;
            }
            return left;
        }

        double parseMultiplication() {
            double left = parseUnary();
            while (hasNext()) {
                String op = peek();
                if (op.equals("*") || op.equals("/")) {
                    next();
                    double right = parseUnary();
                    if (op.equals("*")) left *= right;
                    else {
                        if (right == 0) throw new DivByZeroException("Division by zero");
                        left /= right;
                    }
                } else break;
            }
            return left;
        }

        double parseUnary() {
            if (hasNext() && peek().equals("-")) {
                next();
                return -parsePrimary();
            }
            return parsePrimary();
        }

        double parsePrimary() {
            if (!hasNext()) throw new ValueException("Unexpected end of expression");
            String token = next();

            if (token.equals("(")) {
                double r = parseExpression();
                if (!hasNext() || !next().equals(")")) throw new ValueException("Missing )");
                return r;
            }

            token = token.toUpperCase();

            // Cross-sheet reference: SheetName!CellRef or SheetName!Range
            if (token.contains("!")) {
                int bangIdx = token.indexOf("!");
                String sheetName = token.substring(0, bangIdx);
                String cellRef = token.substring(bangIdx + 1);
                Map<String, String> targetCells = getSheetCells(sheetName);
                if (cellRef.contains(":")) {
                    return resolveRange(cellRef, targetCells);
                }
                return resolveCell(cellRef, targetCells);
            }

            if (token.matches("[A-Z]+") && hasNext() && peek().equals("(")) {
                next();
                return parseFunction(token);
            }

            if (token.equals("TRUE")) return 1.0;
            if (token.equals("FALSE")) return 0.0;

            if (token.contains(":")) {
                return resolveRange(token);
            }

            if (token.matches("[A-Z]+\\d+")) {
                return resolveCell(token);
            }

            try {
                return Double.parseDouble(token);
            } catch (NumberFormatException e) {
                throw new ValueException("Cannot parse: '" + token + "'");
            }
        }

        double parseFunction(String funcName) {
            String func = funcName.toUpperCase();
            List<Double> args = new ArrayList<>();
            while (true) {
                if (!hasNext()) throw new ValueException("Missing ) in " + func);
                String t = peek();
                if (t.equals(")")) { next(); break; }
                if (t.equals(",")) { next(); continue; }
                double val = parseExpression();
                args.add(val);
                if (hasNext() && peek().equals(",")) {
                    next();
                } else {
                    break;
                }
            }
            return evaluateFunction(func, args);
        }

        double resolveRange(String range) {
            return resolveRange(range, cellValues);
        }

        double resolveRange(String range, Map<String, String> targetCells) {
            String[] parts = range.split(":");
            if (parts.length != 2) throw new ValueException("Invalid range: " + range);
            int[] start = parseCellRef(parts[0].trim());
            int[] end = parseCellRef(parts[1].trim());
            int startCol = start[0], startRow = start[1];
            int endCol = end[0], endRow = end[1];
            double total = 0;
            int count = 0;
            for (int c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
                for (int r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
                    String ref = colToLetter(c) + r;
                    String val = targetCells.get(ref);
                    if (val != null && !val.isEmpty()) {
                        try {
                            total += Double.parseDouble(val.trim());
                            count++;
                        } catch (NumberFormatException ignored) {}
                    }
                }
            }
            return total;
        }

        double resolveCell(String ref) {
            return resolveCell(ref, cellValues);
        }

        double resolveCell(String ref, Map<String, String> targetCells) {
            String val = targetCells.get(ref);
            if (val == null || val.isEmpty()) return 0;
            try {
                return Double.parseDouble(val.trim());
            } catch (NumberFormatException e) {
                return 0;
            }
        }

        Map<String, String> getSheetCells(String sheetName) {
            if (allSheetCells != null) {
                Map<String, String> cells = allSheetCells.get(sheetName);
                if (cells != null) return cells;
                // Try case-insensitive lookup
                for (Map.Entry<String, Map<String, String>> entry : allSheetCells.entrySet()) {
                    if (entry.getKey().equalsIgnoreCase(sheetName)) {
                        return entry.getValue();
                    }
                }
            }
            // Fall back to current sheet cells
            return cellValues;
        }

        int[] parseCellRef(String ref) {
            int i = 0;
            while (i < ref.length() && Character.isLetter(ref.charAt(i))) i++;
            String colPart = ref.substring(0, i);
            String rowPart = ref.substring(i);
            return new int[]{colToNum(colPart), Integer.parseInt(rowPart)};
        }
    }

    private double evaluateFunction(String func, List<Double> args) {
        switch (func) {
            case "SUM": {
                double total = 0;
                for (double a : args) total += a;
                return total;
            }
            case "AVERAGE": {
                if (args.isEmpty()) throw new DivByZeroException("AVERAGE of empty range");
                double total = 0;
                for (double a : args) total += a;
                return total / args.size();
            }
            case "COUNT": {
                return (double) args.size();
            }
            case "MIN": {
                if (args.isEmpty()) return 0;
                double min = Double.MAX_VALUE;
                for (double a : args) min = Math.min(min, a);
                return min;
            }
            case "MAX": {
                if (args.isEmpty()) return 0;
                double max = -Double.MAX_VALUE;
                for (double a : args) max = Math.max(max, a);
                return max;
            }
            case "ROUND": {
                if (args.size() < 2) throw new ValueException("ROUND needs 2 arguments");
                double val = args.get(0);
                int places = args.get(1).intValue();
                double factor = Math.pow(10, places);
                return Math.round(val * factor) / factor;
            }
            case "IF": {
                if (args.size() < 3) throw new ValueException("IF needs 3 arguments");
                return args.get(0) != 0 ? args.get(1) : args.get(2);
            }
            case "ABS": {
                if (args.isEmpty()) return 0;
                return Math.abs(args.get(0));
            }
            case "SQRT": {
                if (args.isEmpty()) throw new ValueException("SQRT needs 1 argument");
                return Math.sqrt(args.get(0));
            }
            case "POWER": {
                if (args.size() < 2) throw new ValueException("POWER needs 2 arguments");
                return Math.pow(args.get(0), args.get(1));
            }
            default:
                throw new NameException("Unknown function: " + func);
        }
    }

    private int colToNum(String col) {
        int num = 0;
        for (char c : col.toUpperCase().toCharArray()) {
            num = num * 26 + (c - 'A' + 1);
        }
        return num;
    }

    private String colToLetter(int num) {
        StringBuilder sb = new StringBuilder();
        while (num > 0) {
            num--;
            sb.insert(0, (char) ('A' + num % 26));
            num /= 26;
        }
        return sb.toString();
    }

    private String formatNumber(double num) {
        if (num == Math.round(num) && !Double.isInfinite(num) && !Double.isNaN(num)) {
            return String.valueOf((long) num);
        }
        return String.valueOf(num);
    }

    private static class DivByZeroException extends RuntimeException {
        DivByZeroException(String msg) { super(msg); }
    }

    private static class ValueException extends RuntimeException {
        ValueException(String msg) { super(msg); }
    }

    private static class NameException extends RuntimeException {
        NameException(String msg) { super(msg); }
    }
}