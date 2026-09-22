# TC_03 – Spreadsheet Grid & Cell Editing

**Module:** Spreadsheet Grid Display and Cell Editing  
**Base URL:** http://192.168.1.12:7060/  
**Pre-requisite:** User is authenticated (see TC_01) and has at least one workbook (see TC_02).

---

## TC_001 – Grid displays columns A through Z (26 columns)

**Action:**  
1. Navigate to http://192.168.1.12:7060/  
2. Log in with valid credentials.  
3. Click on a workbook in the list to open it.  
4. Observe the spreadsheet grid.

**Expected Response:**  
- The grid displays column headers A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z (26 columns).  
- Column headers are visible at the top of the grid.  
- No columns beyond Z are visible.  
- The grid is horizontally scrollable if the viewport is narrower than 26 columns.

---

## TC_002 – Grid displays rows 1 through 32

**Action:**  
1. Open a workbook (as in TC_001).  
2. Observe the row headers on the left side of the grid.

**Expected Response:**  
- Row headers 1 through 32 are visible.  
- Row numbers are displayed on the left side of each row.  
- No rows beyond 32 are visible.  
- The grid is vertically scrollable if the viewport is shorter than 32 rows.

---

## TC_003 – Cell selection by click

**Action:**  
1. Open a workbook.  
2. Click on cell C5.

**Expected Response:**  
- Cell C5 is highlighted (selected) with a visible border or background change.  
- No other cell is highlighted.  
- The cell reference C5 is shown in a name box or status indicator (if present).

---

## TC_004 – Cell selection by keyboard navigation (arrow keys)

**Action:**  
1. Open a workbook.  
2. Click on cell A1 to select it.  
3. Press the Right arrow key.  
4. Press the Down arrow key.

**Expected Response:**  
- After Right arrow: cell B1 is selected.  
- After Down arrow: cell B2 is selected.  
- Only one cell is highlighted at a time.

---

## TC_005 – Cell selection by Enter key (moves down)

**Action:**  
1. Open a workbook.  
2. Click on cell A1.  
3. Press Enter.

**Expected Response:**  
- Cell A2 becomes selected.  
- The selection moves down one row.

---

## TC_006 – Text entry into a cell

**Action:**  
1. Open a workbook.  
2. Click on cell A1.  
3. Type "Hello World".  
4. Press Enter.

**Expected Response:**  
- Cell A1 displays "Hello World".  
- The cell value is confirmed (no longer in edit mode).  
- Cell A2 is now selected (auto-move down on Enter).  
- The value is visually distinct from the edit state.

---

## TC_007 – Number entry into a cell

**Action:**  
1. Open a workbook.  
2. Click on cell B1.  
3. Type 42.  
4. Press Enter.

**Expected Response:**  
- Cell B1 displays 42.  
- The number is right-aligned (standard spreadsheet behavior).  
- Cell B2 is now selected.  
- The value is confirmed.

---

## TC_008 – Formula entry into a cell

**Action:**  
1. Open a workbook.  
2. Click on cell A1 and type 10, press Enter.  
3. Click on cell B1 and type 20, press Enter.  
4. Click on cell C1.  
5. Type =A1+B1.  
6. Press Enter.

**Expected Response:**  
- Cell C1 displays 30 (the computed result).  
- The formula =A1+B1 is not displayed in the cell (only the result).  
- Cell C2 is now selected.  
- If the user clicks back on C1, the formula bar (if present) shows =A1+B1.

---

## TC_009 – Auto-update on Enter (value persists in cell)

**Action:**  
1. Open a workbook.  
2. Click on cell D3.  
3. Type "test-value".  
4. Press Enter.  
5. Click on cell A1 (navigate away).  
6. Click back on cell D3.

**Expected Response:**  
- Cell D3 still displays "test-value" after navigating away and back.  
- The value was confirmed and stored when Enter was pressed.  
- No data loss occurred.

---

## TC_010 – Auto-save on Enter (end-to-end persistence)

**Action:**  
1. Open a workbook.  
2. Click on cell E1.  
3. Type "persist-test".  
4. Press Enter.  
5. Wait 2 seconds (allow auto-save to complete).  
6. Navigate away from the workbook (click back to the workbook list).  
7. Re-open the same workbook.  
8. Click on cell E1.

**Expected Response:**  
- Cell E1 displays "persist-test" after re-opening the workbook.  
- The value was auto-saved to the database when Enter was pressed.  
- No explicit "Save" action was required by the user.

---

## TC_011 – Editing an existing cell value (double-click)

**Action:**  
1. Open a workbook.  
2. Click on cell A1 and type "original", press Enter.  
3. Double-click on cell A1.  
4. Type "modified".  
5. Press Enter.

**Expected Response:**  
- Cell A1 displays "modified" after the edit.  
- The original value "original" is replaced.  
- The cell is no longer in edit mode after Enter.

---

## TC_012 – Clearing a cell

**Action:**  
1. Open a workbook.  
2. Click on cell A1 and type "to-delete", press Enter.  
3. Click on cell A1 again.  
4. Press Delete (or Backspace) key.  
5. Press Enter.

**Expected Response:**  
- Cell A1 is empty (no value displayed).  
- The cell is no longer in edit mode.  
- If the user navigates away and back, cell A1 remains empty.

---

## TC_013 – Multiple cells edited in sequence

**Action:**  
1. Open a workbook.  
2. Click on cell A1, type "row1", press Enter.  
3. Click on cell A2, type "row2", press Enter.  
4. Click on cell A3, type "row3", press Enter.  
5. Click on cell B1, type "col1", press Enter.  
6. Click on cell B2, type "col2", press Enter.

**Expected Response:**  
- Cell A1 displays "row1".  
- Cell A2 displays "row2".  
- Cell A3 displays "row3".  
- Cell B1 displays "col1".  
- Cell B2 displays "col2".  
- All values are confirmed and visible simultaneously.

---

## TC_014 – End-to-end: Create workbook, enter data, close, reopen, verify persistence

**Action:**  
1. Navigate to http://192.168.1.12:7060/ and log in.  
2. Create a new workbook named "PersistenceTest".  
3. The workbook opens with a blank grid (Sheet1).  
4. Click on cell A1, type "end-to-end", press Enter.  
5. Click on cell B1, type 999, press Enter.  
6. Click on cell C1, type =A1&"-"&B1, press Enter.  
7. Wait 2 seconds.  
8. Navigate back to the workbook list.  
9. Re-open "PersistenceTest".  
10. Click on cell A1, then B1, then C1.

**Expected Response:**  
- Cell A1 displays "end-to-end".  
- Cell B1 displays 999.  
- Cell C1 displays "end-to-end-999" (formula result).  
- All data persisted through the full cycle: UI → backend → database → backend → UI.  
- No data was lost.

---

## TC_015 – Grid layout is visually consistent (column/row headers aligned)

**Action:**  
1. Open a workbook.  
2. Observe the grid layout.

**Expected Response:**  
- Column headers (A–Z) are aligned with their respective columns.  
- Row headers (1–32) are aligned with their respective rows.  
- The intersection of column header and row header forms a clean grid.  
- Cells are evenly sized (no irregular spacing).  
- The grid has visible borders or separators between cells.

---

## TC_016 – Typing in a cell enters edit mode (visual distinction)

**Action:**  
1. Open a workbook.  
2. Click on cell A1.  
3. Start typing "edit".

**Expected Response:**  
- While typing, cell A1 shows the text being entered in an edit state (e.g., cursor visible, different background or border).  
- The cell is visually distinct from a confirmed/committed state.  
- After pressing Enter, the cell returns to the confirmed state.

---

## TC_017 – Escape cancels cell edit

**Action:**  
1. Open a workbook.  
2. Click on cell A1 and type "original", press Enter.  
3. Click on cell A1 again.  
4. Type "changed".  
5. Press Escape (without pressing Enter).

**Expected Response:**  
- Cell A1 still displays "original" (the edit was cancelled).  
- The value "changed" was not committed.  
- The cell is no longer in edit mode.

---

## TC_018 – Formula with cell reference updates when referenced cell changes

**Action:**  
1. Open a workbook.  
2. Click on cell A1, type 5, press Enter.  
3. Click on cell B1, type =A1*2, press Enter.  
4. Click on cell A1, type 10, press Enter.  
5. Click on cell B1.

**Expected Response:**  
- After step 3: cell B1 displays 10 (5 × 2).  
- After step 4: cell B1 updates to 20 (10 × 2).  
- The formula result recalculates when the referenced cell value changes.

---

## TC_019 – Empty cell displays no value

**Action:**  
1. Open a new workbook (blank grid).  
2. Click on cell F10.  
3. Observe the cell.

**Expected Response:**  
- Cell F10 is empty (no text, no number, no formula result).  
- The cell is selectable but shows no content.  
- No placeholder text or "null" is displayed.

---

## TC_020 – Horizontal and vertical scrolling works

**Action:**  
1. Open a workbook.  
2. Scroll the grid horizontally to the right.  
3. Scroll the grid vertically downward.

**Expected Response:**  
- Horizontal scrolling reveals columns beyond the initial viewport (up to Z).  
- Vertical scrolling reveals rows beyond the initial viewport (up to 32).  
- Column headers remain visible (sticky) during vertical scroll.  
- Row headers remain visible (sticky) during horizontal scroll.  
- No content is cut off or lost during scrolling.