# TC_04: Formula Support

**Functional Group:** Formula entry, evaluation, display, error handling, and persistence  
**Architecture:** Browser UI → Spring Boot (port 7060) → PostgreSQL (port 5432)  
**Base URL:** http://192.168.1.12:7060/

---

## TC_001 — Basic Addition Formula

**Description:** Verify that a simple addition formula (=A1+B2) is entered, evaluated, and displayed correctly.

**Preconditions:**
- User is logged in.
- A workbook named "FormulaTest" has been created and opened.
- Sheet "Sheet1" is active with a blank grid (A–Z, rows 1–32).

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Click on the workbook "FormulaTest" in the workbook list.
3. Wait for the spreadsheet grid to load.
4. Click cell A1. Type `10`. Press Enter.
5. Click cell B2. Type `25`. Press Enter.
6. Click cell C1. Type `=A1+B2`. Press Enter.
7. Observe the displayed value in cell C1.

**Expected Results:**
- Cell A1 displays `10`.
- Cell B2 displays `25`.
- Cell C1 displays `35` (the computed result, not the formula text).
- The formula bar (if visible) shows `=A1+B2` when C1 is selected.

**End-to-End Verification:**
- Check PostgreSQL: `SELECT cell_value FROM cells WHERE workbook_id = (SELECT id FROM workbooks WHERE name='FormulaTest') AND cell_ref='C1';` should return `35`.
- Check that the formula expression `=A1+B2` is stored in a `formula` column or equivalent.

---

## TC_002 — Basic Subtraction Formula

**Description:** Verify subtraction formula (=A1-B2) computes correctly.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `50`. Press Enter.
3. Click cell B2. Type `18`. Press Enter.
4. Click cell C1. Type `=A1-B2`. Press Enter.
5. Observe the displayed value in cell C1.

**Expected Results:**
- Cell C1 displays `32`.

**End-to-End Verification:**
- PostgreSQL: cell C1 value = `32`.

---

## TC_003 — Basic Multiplication Formula

**Description:** Verify multiplication formula (=A1*B2) computes correctly.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `7`. Press Enter.
3. Click cell B2. Type `6`. Press Enter.
4. Click cell C1. Type `=A1*B2`. Press Enter.
5. Observe the displayed value in cell C1.

**Expected Results:**
- Cell C1 displays `42`.

---

## TC_004 — Basic Division Formula

**Description:** Verify division formula (=A1/B2) computes correctly.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `100`. Press Enter.
3. Click cell B2. Type `4`. Press Enter.
4. Click cell C1. Type `=A1/B2`. Press Enter.
5. Observe the displayed value in cell C1.

**Expected Results:**
- Cell C1 displays `25`.

---

## TC_005 — Division by Zero Error

**Description:** Verify that dividing by zero produces a `#DIV/0!` error.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `50`. Press Enter.
3. Click cell B2. Type `0`. Press Enter.
4. Click cell C1. Type `=A1/B2`. Press Enter.
5. Observe the displayed value in cell C1.

**Expected Results:**
- Cell C1 displays `#DIV/0!` (or equivalent error indicator).
- The error is visually distinct (e.g., red text or warning styling).

**End-to-End Verification:**
- PostgreSQL: cell C1 value or error flag reflects the division-by-zero error state.

---

## TC_006 — SUM Function

**Description:** Verify the SUM function aggregates a range of cells.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `10`. Press Enter.
3. Click cell A2. Type `20`. Press Enter.
4. Click cell A3. Type `30`. Press Enter.
5. Click cell A4. Type `40`. Press Enter.
6. Click cell B1. Type `=SUM(A1:A4)`. Press Enter.
7. Observe the displayed value in cell B1.

**Expected Results:**
- Cell B1 displays `100`.

**End-to-End Verification:**
- PostgreSQL: cell B1 value = `100`.

---

## TC_007 — AVERAGE Function

**Description:** Verify the AVERAGE function computes the mean of a range.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `20`. Press Enter.
3. Click cell A2. Type `40`. Press Enter.
4. Click cell A3. Type `60`. Press Enter.
5. Click cell B1. Type `=AVERAGE(A1:A3)`. Press Enter.
6. Observe the displayed value in cell B1.

**Expected Results:**
- Cell B1 displays `40`.

---

## TC_008 — COUNT Function

**Description:** Verify the COUNT function counts numeric cells in a range.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `5`. Press Enter.
3. Click cell A2. Type `hello`. Press Enter.
4. Click cell A3. Type `10`. Press Enter.
5. Click cell A4. Type `world`. Press Enter.
6. Click cell A5. Type `15`. Press Enter.
7. Click cell B1. Type `=COUNT(A1:A5)`. Press Enter.
8. Observe the displayed value in cell B1.

**Expected Results:**
- Cell B1 displays `3` (only numeric cells are counted).

---

## TC_009 — MIN and MAX Functions

**Description:** Verify MIN and MAX functions return the smallest and largest values in a range.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `42`. Press Enter.
3. Click cell A2. Type `17`. Press Enter.
4. Click cell A3. Type `93`. Press Enter.
5. Click cell A4. Type `5`. Press Enter.
6. Click cell B1. Type `=MIN(A1:A4)`. Press Enter.
7. Click cell B2. Type `=MAX(A1:A4)`. Press Enter.
8. Observe displayed values.

**Expected Results:**
- Cell B1 displays `5`.
- Cell B2 displays `93`.

---

## TC_010 — Formula Recalculation on Referenced Cell Change

**Description:** Verify that a formula recalculates when a referenced cell's value changes.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `10`. Press Enter.
3. Click cell B1. Type `=A1*2`. Press Enter.
4. Verify cell B1 displays `20`.
5. Click cell A1. Type `50`. Press Enter.
6. Observe cell B1.

**Expected Results:**
- After step 4: Cell B1 displays `20`.
- After step 6: Cell B1 displays `100` (recalculated automatically).

**End-to-End Verification:**
- PostgreSQL: cell B1 value = `100` after the update.

---

## TC_011 — IF Function

**Description:** Verify the IF function returns different values based on a condition.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `75`. Press Enter.
3. Click cell B1. Type `=IF(A1>=60,"PASS","FAIL")`. Press Enter.
4. Observe the displayed value in cell B1.
5. Click cell A1. Type `40`. Press Enter.
6. Observe the displayed value in cell B1.

**Expected Results:**
- After step 4: Cell B1 displays `PASS`.
- After step 6: Cell B1 displays `FAIL`.

---

## TC_012 — ROUND Function

**Description:** Verify the ROUND function rounds a value to a specified number of decimal places.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `=10/3`. Press Enter.
3. Observe cell A1 displays approximately `3.333333` (or `3.33` depending on display precision).
4. Click cell B1. Type `=ROUND(A1,2)`. Press Enter.
5. Observe the displayed value in cell B1.

**Expected Results:**
- Cell B1 displays `3.33`.

---

## TC_013 — Nested Formula

**Description:** Verify that a formula referencing another formula cell recalculates correctly (nested dependency).

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `100`. Press Enter.
3. Click cell B1. Type `=A1*2`. Press Enter. (B1 = 200)
4. Click cell C1. Type `=B1+50`. Press Enter. (C1 = 250)
5. Click cell A1. Type `200`. Press Enter.
6. Observe cells B1 and C1.

**Expected Results:**
- After step 5: Cell B1 displays `400`, Cell C1 displays `450`.
- Both formulas recalculate in dependency order.

**End-to-End Verification:**
- PostgreSQL: B1 = `400`, C1 = `450`.

---

## TC_014 — Invalid Formula Name Error

**Description:** Verify that an unrecognized function name produces a `#NAME?` error.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `=FOOBAR(A1)`. Press Enter.
3. Observe the displayed value in cell A1.

**Expected Results:**
- Cell A1 displays `#NAME?` (or equivalent error indicator).
- The error is visually distinct from valid numeric results.

---

## TC_015 — Formula with Text Value Error

**Description:** Verify that applying arithmetic to a text cell produces a `#VALUE!` error.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `hello`. Press Enter.
3. Click cell B1. Type `=A1+5`. Press Enter.
4. Observe the displayed value in cell B1.

**Expected Results:**
- Cell B1 displays `#VALUE!` (or equivalent error indicator).

---

## TC_016 — Formula Persistence via Auto-Save

**Description:** Verify that formulas are persisted to the database and restored on reload.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `10`. Press Enter.
3. Click cell A2. Type `20`. Press Enter.
4. Click cell B1. Type `=SUM(A1:A2)`. Press Enter.
5. Verify cell B1 displays `30`.
6. Refresh the browser page (F5 or Ctrl+R).
7. Navigate back to the workbook "FormulaTest".
8. Observe cell B1.

**Expected Results:**
- After reload, cell B1 displays `30` (the computed result).
- The formula `=SUM(A1:A2)` is preserved (visible in formula bar if present).

**End-to-End Verification:**
- PostgreSQL: `SELECT formula, cell_value FROM cells WHERE cell_ref='B1' AND workbook_id=(SELECT id FROM workbooks WHERE name='FormulaTest');` returns formula `=SUM(A1:A2)` and value `30`.

---

## TC_017 — Formula with Mixed Numeric and Text in Range

**Description:** Verify that SUM ignores text values in a range.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `10`. Press Enter.
3. Click cell A2. Type `abc`. Press Enter.
4. Click cell A3. Type `20`. Press Enter.
5. Click cell A4. Type `def`. Press Enter.
6. Click cell A5. Type `30`. Press Enter.
7. Click cell B1. Type `=SUM(A1:A5)`. Press Enter.
8. Observe the displayed value in cell B1.

**Expected Results:**
- Cell B1 displays `60` (only numeric values 10+20+30 are summed).

---

## TC_018 — Formula Entry Triggers Formula Mode

**Description:** Verify that typing `=` in a cell switches to formula input mode.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1.
3. Type `=`.
4. Observe the cell state and any visual indicator (e.g., formula bar highlight, cursor change, or mode indicator).
5. Type `A1+1`.
6. Press Enter.

**Expected Results:**
- After step 4: The cell is in formula input mode (visually indicated).
- After step 6: Cell A1 displays `1` (since A1 was empty/0, 0+1=1). Or if A1 had a prior value, the formula references itself appropriately.

**Note:** If self-referencing is not supported, the test should use a different cell (e.g., type `=B1+1` in A1 after setting B1 to a value).

---

## TC_019 — Formula with Negative Numbers

**Description:** Verify formulas handle negative numbers correctly.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `-50`. Press Enter.
3. Click cell B1. Type `=A1+100`. Press Enter.
4. Observe the displayed value in cell B1.

**Expected Results:**
- Cell B1 displays `50`.

---

## TC_020 — Formula Display Precision

**Description:** Verify that formulas with decimal results display with reasonable precision.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `=10/3`. Press Enter.
3. Observe the displayed value in cell A1.

**Expected Results:**
- Cell A1 displays a value with reasonable decimal precision (e.g., `3.33` or `3.333333`).
- The display should not show an unreasonably long decimal string (e.g., more than 10 decimal places without rounding).

---

## TC_021 — Multiple Formulas in Same Workbook

**Description:** Verify that multiple independent formulas coexist and calculate correctly in the same sheet.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `5`. Press Enter.
3. Click cell A2. Type `10`. Press Enter.
4. Click cell A3. Type `15`. Press Enter.
5. Click cell B1. Type `=SUM(A1:A3)`. Press Enter.
6. Click cell B2. Type `=A1*A2`. Press Enter.
7. Click cell B3. Type `=A3-A1`. Press Enter.
8. Observe all three formula cells.

**Expected Results:**
- Cell B1 displays `30`.
- Cell B2 displays `50`.
- Cell B3 displays `10`.

**End-to-End Verification:**
- PostgreSQL: All three formula cells stored with correct formula expressions and computed values.

---

## TC_022 — Formula in Different Sheet

**Description:** Verify that formulas work correctly when the user switches between sheets within a workbook.

**Preconditions:**
- User has a workbook with at least two sheets (Sheet1 and Sheet2).

**Steps:**
1. Open workbook "FormulaTest".
2. Ensure Sheet1 is active.
3. Click cell A1. Type `42`. Press Enter.
4. Click cell B1. Type `=A1*3`. Press Enter.
5. Verify cell B1 displays `126`.
6. Click on the "Sheet2" tab at the bottom of the screen.
7. Click cell A1 on Sheet2. Type `=100+200`. Press Enter.
8. Observe the displayed value.
9. Click back to the "Sheet1" tab.
10. Observe cell B1 on Sheet1.

**Expected Results:**
- Sheet2 A1 displays `300`.
- Sheet1 B1 still displays `126` (formulas are sheet-scoped).

**End-to-End Verification:**
- PostgreSQL: Formulas are stored with their respective sheet_id references.

---

## TC_023 — Formula Recalculation After Reload

**Description:** Verify that formulas are recalculated correctly after a page reload (not just cached values).

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `10`. Press Enter.
3. Click cell A2. Type `20`. Press Enter.
4. Click cell B1. Type `=A1+A2`. Press Enter. (B1 = 30)
5. Refresh the browser page.
6. Re-open workbook "FormulaTest".
7. Click cell A1. Type `100`. Press Enter.
8. Observe cell B1.

**Expected Results:**
- After step 8: Cell B1 displays `120` (recalculated from new A1 value + A2 value of 20).

**End-to-End Verification:**
- PostgreSQL: B1 value = `120` after the update.

---

## TC_024 — Formula with Empty Cell Reference

**Description:** Verify that referencing an empty cell in a formula treats it as zero.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Ensure cell A1 is empty.
3. Click cell B1. Type `=A1+50`. Press Enter.
4. Observe the displayed value in cell B1.

**Expected Results:**
- Cell B1 displays `50` (empty cell treated as 0).

---

## TC_025 — Formula Error State Persists on Reload

**Description:** Verify that a formula error state (e.g., #DIV/0!) is preserved after reload.

**Preconditions:**
- Same as TC_001.

**Steps:**
1. Open workbook "FormulaTest".
2. Click cell A1. Type `10`. Press Enter.
3. Click cell B1. Type `0`. Press Enter.
4. Click cell C1. Type `=A1/B1`. Press Enter.
5. Verify cell C1 displays `#DIV/0!`.
6. Refresh the browser page.
7. Re-open workbook "FormulaTest".
8. Observe cell C1.

**Expected Results:**
- After reload, cell C1 still displays `#DIV/0!`.

**End-to-End Verification:**
- PostgreSQL: The error state is persisted (either as a value string or an error flag).