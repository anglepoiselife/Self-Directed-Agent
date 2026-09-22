package com.sheets.service;

import com.sheets.dto.CellDTO;
import com.sheets.dto.CellUpdateRequest;
import com.sheets.entity.Cell;
import com.sheets.entity.Sheet;
import com.sheets.repository.CellRepository;
import com.sheets.repository.SheetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CellService {

    private static final Logger log = LoggerFactory.getLogger(CellService.class);

    private final CellRepository cellRepository;
    private final SheetRepository sheetRepository;
    private final FormulaService formulaService;

    public CellService(CellRepository cellRepository, SheetRepository sheetRepository, FormulaService formulaService) {
        this.cellRepository = cellRepository;
        this.sheetRepository = sheetRepository;
        this.formulaService = formulaService;
    }

    @Transactional
    public List<CellDTO> getCellsForSheet(UUID sheetId) {
        List<Cell> cells = cellRepository.findBySheet_Id(sheetId);
        Map<String, String> cellValues = new HashMap<>();
        for (Cell c : cells) {
            String ref = buildCellRef(c.getRow(), c.getCol());
            if (c.getComputedValue() != null) {
                cellValues.put(ref, c.getComputedValue());
            } else if (c.getValue() != null) {
                cellValues.put(ref, c.getValue());
            }
        }

        Map<String, Map<String, String>> allSheetCells = buildAllSheetCells(sheetId);

        for (Cell c : cells) {
            if (c.getFormula() != null && !c.getFormula().isEmpty()) {
                try {
                    String result = formulaService.evaluate(c.getFormula(), cellValues, allSheetCells);
                    c.setComputedValue(result);
                    cellValues.put(buildCellRef(c.getRow(), c.getCol()), result);
                } catch (Exception e) {
                    c.setComputedValue("#VALUE!");
                }
            }
        }
        cellRepository.saveAll(cells);
        return cells.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CellDTO updateCell(UUID sheetId, Integer row, Integer col, String value, String cellType, String formula) {
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("Sheet not found: " + sheetId));

        Cell cell = cellRepository.findBySheet_IdAndRowAndCol(sheetId, row, col)
                .orElseGet(() -> {
                    Cell newCell = new Cell();
                    newCell.setSheet(sheet);
                    newCell.setRow(row);
                    newCell.setCol(col);
                    newCell.setCellRef(buildCellRef(row, col));
                    newCell.setCreatedAt(LocalDateTime.now());
                    return newCell;
                });

        cell.setValue(value);
        cell.setCellType(cellType != null ? cellType : "text");
        cell.setFormula(formula);
        cell.setComputedValue(computeValue(value, formula, sheetId));
        cell.setUpdatedAt(LocalDateTime.now());

        Cell saved = cellRepository.save(cell);
        return toDTO(saved);
    }

    @Transactional
    public List<CellDTO> bulkUpdateCells(UUID sheetId, List<CellUpdateRequest> updates) {
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("Sheet not found: " + sheetId));

        List<CellDTO> results = updates.stream().map(update -> {
            Cell cell = cellRepository.findBySheet_IdAndRowAndCol(sheetId, update.row(), update.col())
                    .orElseGet(() -> {
                        Cell newCell = new Cell();
                        newCell.setSheet(sheet);
                        newCell.setRow(update.row());
                        newCell.setCol(update.col());
                        newCell.setCellRef(buildCellRef(update.row(), update.col()));
                        newCell.setCreatedAt(LocalDateTime.now());
                        return newCell;
                    });

            cell.setValue(update.value());
            cell.setCellType(update.cellType() != null ? update.cellType() : "text");
            cell.setFormula(update.formula());
            cell.setComputedValue(computeValue(update.value(), update.formula(), sheetId));
            cell.setUpdatedAt(LocalDateTime.now());

            Cell saved = cellRepository.save(cell);
            return toDTO(saved);
        }).collect(Collectors.toList());

        return results;
    }

    @Transactional
    public List<CellDTO> recalculateFormulas(UUID sheetId) {
        List<Cell> cells = cellRepository.findBySheet_Id(sheetId);

        List<CellDTO> results = cells.stream()
                .filter(cell -> "formula".equals(cell.getCellType()) && cell.getFormula() != null)
                .map(cell -> {
                    cell.setComputedValue(computeValue(cell.getValue(), cell.getFormula(), sheetId));
                    cell.setUpdatedAt(LocalDateTime.now());
                    Cell saved = cellRepository.save(cell);
                    return toDTO(saved);
                })
                .collect(Collectors.toList());

        return results;
    }

    private String computeValue(String value, String formula, UUID sheetId) {
        if (formula != null && !formula.isEmpty()) {
            return evaluateFormula(formula, sheetId);
        }
        return value;
    }

    private String evaluateFormula(String formula, UUID sheetId) {
        if (formula.startsWith("=")) {
            try {
                List<Cell> cells = cellRepository.findBySheet_Id(sheetId);
                Map<String, String> cellValues = new HashMap<>();
                for (Cell cell : cells) {
                    String ref = buildCellRef(cell.getRow(), cell.getCol());
                    String val = cell.getComputedValue() != null ? cell.getComputedValue() : cell.getValue();
                    cellValues.put(ref, val);
                }
                Map<String, Map<String, String>> allSheetCells = buildAllSheetCells(sheetId);
                String result = formulaService.evaluate(formula, cellValues, allSheetCells);
                return result;
            } catch (Exception e) {
                log.error("[FORMULA EVAL ERROR] formula={} exception={}: {}", formula, e.getClass().getName(), e.getMessage());
                return formula;
            }
        }
        return formula;
    }

    private Map<String, Map<String, String>> buildAllSheetCells(UUID sheetId) {
        Map<String, Map<String, String>> allSheetCells = new HashMap<>();
        try {
            Sheet sheet = sheetRepository.findById(sheetId).orElse(null);
            if (sheet == null || sheet.getWorkbook() == null) {
                return allSheetCells;
            }
            UUID workbookId = sheet.getWorkbook().getId();
            List<Sheet> allSheets = sheetRepository.findByWorkbook_Id(workbookId);
            for (Sheet s : allSheets) {
                List<Cell> sCells = cellRepository.findBySheet_Id(s.getId());
                Map<String, String> sCellValues = new HashMap<>();
                for (Cell c : sCells) {
                    String ref = buildCellRef(c.getRow(), c.getCol());
                    String val = c.getComputedValue() != null ? c.getComputedValue() : c.getValue();
                    if (val != null) {
                        sCellValues.put(ref, val);
                    }
                }
                allSheetCells.put(s.getName(), sCellValues);
            }
        } catch (Exception e) {
            log.error("[BUILD ALL SHEET CELLS] error: {}", e.getMessage());
        }
        return allSheetCells;
    }

    private String buildCellRef(Integer row, Integer col) {
        return String.valueOf((char)('A' + col)) + (row + 1);
    }

    private CellDTO toDTO(Cell cell) {
        return new CellDTO(
            cell.getId().toString(),
            cell.getSheet().getId().toString(),
            cell.getRow(),
            cell.getCol(),
            cell.getCellRef(),
            cell.getValue(),
            cell.getCellType(),
            cell.getFormula(),
            cell.getComputedValue(),
            cell.getUpdatedAt()
        );
    }
}