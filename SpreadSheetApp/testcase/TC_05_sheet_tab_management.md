# TC_05: Sheet Tab Management

## Overview
This test case file covers the sheet tab management functionality of the Sheets application. It verifies that the bottom sheet tab bar allows users to add, delete, switch between, and rename sheets within a workbook, and that all operations are persisted to the database.

## Architecture Context
- **Frontend**: React/Vite served by Spring Boot on port 7060
- **Backend**: Spring Boot (Java) on port 7060, REST + WebSocket endpoints
- **Database**: PostgreSQL on port 5432
- **Health Check**: GET /ws/health → {"status":"UP"}
- **Navigation**: All tests start from http://192.168.1.12:7060/

## Preconditions
- User is authenticated (logged in)
- A workbook exists with at least one sheet (Sheet1)
- The workbook is opened in the spreadsheet view

---

## TC_001: Default Sheet1 Behaviour on New Workbook

**Objective**: Verify that a newly created workbook opens with a single sheet named "Sheet1" visible in the tab bar.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Click the "Create" button to create a new workbook
4. Enter workbook name "TestWorkbook_Sheets" and confirm
5. Observe the spreadsheet view that opens

**Expected Response**:
- The spreadsheet grid is displayed (columns A–Z, rows 1–32)
- The bottom tab bar shows exactly one tab labeled "Sheet1"
- The "Sheet1" tab is highlighted/active (indicating it is the current sheet)
- No other tabs are visible
- The title bar shows "TestWorkbook_Sheets"

**Database Verification**:
- Query: `SELECT id, name, position FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets');`
- Expected: One row with name = 'Sheet1', position = 0 (or 1, depending on convention)
- Query: `SELECT id, name FROM workbooks WHERE name = 'TestWorkbook_Sheets';`
- Expected: One row confirming the workbook exists

---

## TC_002: Adding a New Sheet

**Objective**: Verify that clicking the "Add Sheet" button (or equivalent + icon) in the tab bar creates a new sheet with an auto-generated name.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Observe the current tab bar (should show "Sheet1")
5. Click the "+" (Add Sheet) button in the bottom tab bar
6. Observe the new tab that appears

**Expected Response**:
- A new tab appears in the bottom tab bar labeled "Sheet2"
- The new tab is highlighted/active (becomes the current sheet)
- The spreadsheet grid is displayed (columns A–Z, rows 1–32) and is blank
- The previous "Sheet1" tab is still visible but no longer active
- The title bar still shows "TestWorkbook_Sheets"

**Database Verification**:
- Query: `SELECT id, name, position FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets') ORDER BY position;`
- Expected: Two rows — "Sheet1" (position 0) and "Sheet2" (position 1)
- Query: `SELECT COUNT(*) FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets');`
- Expected: 2

---

## TC_003: Adding Multiple Sheets

**Objective**: Verify that adding multiple sheets sequentially produces correctly numbered tabs.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Click the "+" (Add Sheet) button three times in succession
5. Observe the tab bar

**Expected Response**:
- The tab bar shows: "Sheet1", "Sheet2", "Sheet3", "Sheet4", "Sheet5"
- The last added tab ("Sheet5") is highlighted/active
- Each tab is clickable and the grid is blank for each new sheet

**Database Verification**:
- Query: `SELECT name, position FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets') ORDER BY position;`
- Expected: Five rows — Sheet1 (0), Sheet2 (1), Sheet3 (2), Sheet4 (3), Sheet5 (4)

---

## TC_004: Switching Between Sheets

**Objective**: Verify that clicking a different sheet tab switches the active sheet and preserves data in each sheet.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Ensure "Sheet1" is active
5. Click on cell A1 and type "Hello" then press Enter
6. Click on the "Sheet2" tab
7. Observe the grid
8. Click on cell A1 and type "World" then press Enter
9. Click back on the "Sheet1" tab
10. Observe the grid

**Expected Response**:
- After step 6: The "Sheet2" tab is highlighted/active, grid is blank
- After step 8: Cell A1 in Sheet2 shows "World"
- After step 9: The "Sheet1" tab is highlighted/active
- After step 10: Cell A1 in Sheet1 shows "Hello" (data preserved)
- Switching does not lose or mix data between sheets

**Database Verification**:
- Query: `SELECT value FROM cells WHERE sheet_id = (SELECT id FROM sheets WHERE name = 'Sheet1' AND workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets')) AND row = 0 AND col = 0;`
- Expected: "Hello"
- Query: `SELECT value FROM cells WHERE sheet_id = (SELECT id FROM sheets WHERE name = 'Sheet2' AND workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets')) AND row = 0 AND col = 0;`
- Expected: "World"

---

## TC_005: Renaming a Sheet

**Objective**: Verify that a sheet can be renamed by double-clicking or right-clicking the tab and entering a new name.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Double-click on the "Sheet1" tab (or right-click → Rename)
5. An editable text field appears in the tab
6. Clear the existing text and type "Financials"
7. Press Enter (or click elsewhere to confirm)
8. Observe the tab bar

**Expected Response**:
- The tab that previously said "Sheet1" now displays "Financials"
- The tab remains active
- The grid content is unchanged
- The title bar still shows the workbook name "TestWorkbook_Sheets"

**Database Verification**:
- Query: `SELECT name FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets') AND position = 0;`
- Expected: "Financials"

---

## TC_006: Renaming a Sheet to a Duplicate Name

**Objective**: Verify that the system prevents or handles duplicate sheet names within the same workbook.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Ensure "Sheet2" exists
5. Double-click on the "Sheet1" tab (or right-click → Rename)
6. Type "Sheet2" (which already exists)
7. Press Enter to confirm

**Expected Response**:
- One of the following behaviours:
  - A validation error message appears (e.g., "Sheet name already exists") and the rename is rejected, keeping the original name
  - OR the system auto-appends a suffix (e.g., "Sheet2 (1)")
- The original name is preserved if the rename is rejected
- No data loss occurs

**Database Verification**:
- Query: `SELECT name FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets') ORDER BY position;`
- Expected: No duplicate names in the result set

---

## TC_007: Deleting a Sheet

**Objective**: Verify that a sheet can be deleted from the tab bar and the data is removed from the database.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Ensure at least two sheets exist (e.g., "Sheet1" and "Sheet2")
5. Click on "Sheet2" to make it active
6. Enter data in cell A1: "DeleteMe" and press Enter
7. Right-click on the "Sheet2" tab (or click a delete/× icon on the tab)
8. A confirmation dialog appears: "Are you sure you want to delete 'Sheet2'?"
9. Click "Yes" / "Confirm"
10. Observe the tab bar and grid

**Expected Response**:
- The "Sheet2" tab is removed from the tab bar
- The active sheet switches to the adjacent sheet (e.g., "Sheet1")
- The grid displays the data from the now-active sheet
- The deleted tab is no longer visible

**Database Verification**:
- Query: `SELECT name FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets') ORDER BY position;`
- Expected: "Sheet2" is NOT in the result set
- Query: `SELECT value FROM cells WHERE sheet_id = (SELECT id FROM sheets WHERE name = 'Sheet2' AND workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets')) AND row = 0 AND col = 0;`
- Expected: No rows (data is cascade-deleted or the sheet row is removed)

---

## TC_008: Deleting the Last Remaining Sheet

**Objective**: Verify that the system prevents deletion of the last sheet in a workbook (a workbook must always have at least one sheet).

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Delete all sheets except one (so only "Sheet1" remains)
5. Right-click on the "Sheet1" tab (or click delete/× icon)
6. Observe the response

**Expected Response**:
- One of the following behaviours:
  - The delete action is disabled (greyed out or not shown)
  - OR a confirmation dialog appears but clicking "Yes" shows an error: "Cannot delete the last sheet"
  - OR the delete is simply not performed
- The "Sheet1" tab remains visible
- The grid is still displayed with its data intact
- No data loss occurs

**Database Verification**:
- Query: `SELECT COUNT(*) FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets');`
- Expected: 1 (the sheet still exists)

---

## TC_009: Sheet Tab Order After Deletion

**Objective**: Verify that after deleting a middle sheet, the remaining tabs maintain correct order.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Ensure three sheets exist: "Sheet1", "Sheet2", "Sheet3"
5. Delete "Sheet2"
6. Observe the tab bar order

**Expected Response**:
- The tab bar shows: "Sheet1", "Sheet3"
- "Sheet1" is first, "Sheet3" is second
- The active sheet is either "Sheet1" or "Sheet3" (the adjacent sheet)
- No gap or empty space appears in the tab bar

**Database Verification**:
- Query: `SELECT name, position FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets') ORDER BY position;`
- Expected: "Sheet1" (position 0), "Sheet3" (position 1 or 2 depending on whether positions are re-sequenced)

---

## TC_010: Switching Sheets Preserves Scroll Position

**Objective**: Verify that switching between sheets preserves the scroll position of each sheet independently.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Ensure "Sheet1" and "Sheet2" exist
5. On "Sheet1", scroll down to row 20
6. Click on "Sheet2" tab
7. Observe the scroll position on Sheet2
8. Click back on "Sheet1" tab
9. Observe the scroll position on Sheet1

**Expected Response**:
- After step 7: Sheet2 is displayed at its own scroll position (default top, or wherever it was last)
- After step 9: Sheet1 is displayed at row 20 (preserved scroll position)
- Each sheet maintains its own independent scroll state

---

## TC_011: Sheet Tab Bar Visibility and Layout

**Objective**: Verify that the sheet tab bar is always visible at the bottom of the screen and displays correctly.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Observe the bottom of the screen
5. Add 5 sheets so there are 6 tabs total
6. Observe the tab bar layout

**Expected Response**:
- The tab bar is fixed at the bottom of the viewport (does not scroll with the grid)
- All tabs are visible (or horizontally scrollable if they overflow)
- Each tab shows the sheet name
- The active tab is visually distinct (highlighted, different colour, or underline)
- The "+" button for adding a new sheet is visible in the tab bar
- The tab bar does not overlap with the grid content

---

## TC_012: Formula References Across Sheets

**Objective**: Verify that formulas can reference cells in other sheets within the same workbook.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Ensure "Sheet1" and "Sheet2" exist
5. On "Sheet1", enter 10 in cell A1 and press Enter
6. On "Sheet1", enter 20 in cell B1 and press Enter
7. Switch to "Sheet2"
8. In cell A1, type `=Sheet1!A1+Sheet1!B1` and press Enter
9. Observe the result in cell A1 of Sheet2

**Expected Response**:
- Cell A1 on Sheet2 displays "30" (the computed result)
- The formula bar (if visible) shows `=Sheet1!A1+Sheet1!B1`
- The cross-sheet reference is correctly resolved

**Database Verification**:
- Query: `SELECT value, formula FROM cells WHERE sheet_id = (SELECT id FROM sheets WHERE name = 'Sheet2' AND workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets')) AND row = 0 AND col = 0;`
- Expected: value = 30, formula = '=Sheet1!A1+Sheet1!B1'

---

## TC_013: Auto-Save of Sheet Tab Changes

**Objective**: Verify that sheet tab changes (add, delete, rename) are auto-saved to the database without requiring an explicit save action.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Add a new sheet (creates "Sheet2")
5. Rename "Sheet2" to "Budget"
6. Delete "Sheet2" (now named "Budget")
7. Wait 2 seconds
8. Refresh the browser (F5)
9. Observe the tab bar

**Expected Response**:
- After step 9: The tab bar shows only "Sheet1" (and any other pre-existing sheets)
- The "Budget" / "Sheet2" tab is not present
- All changes were persisted without an explicit save action
- No data loss from the refresh

**Database Verification**:
- Query: `SELECT name FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets') ORDER BY position;`
- Expected: Only "Sheet1" (and any sheets that were not deleted)

---

## TC_014: Renaming a Sheet Preserves All Cell Data

**Objective**: Verify that renaming a sheet does not affect any cell data, formulas, or references within that sheet.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. On "Sheet1", enter 100 in A1, 200 in A2, and `=A1+A2` in A3
5. Rename "Sheet1" to "AnnualReport"
6. Observe cell A3
7. Switch to "Sheet2" and enter `=AnnualReport!A3` in A1
8. Observe the result

**Expected Response**:
- After step 6: Cell A3 on "AnnualReport" still shows 300
- After step 8: Cell A1 on Sheet2 shows 300 (cross-sheet reference uses the new name)
- All data and formulas are intact after renaming

**Database Verification**:
- Query: `SELECT name FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets') AND position = 0;`
- Expected: "AnnualReport"
- Query: `SELECT value FROM cells WHERE sheet_id = (SELECT id FROM sheets WHERE name = 'AnnualReport' AND workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets')) AND row = 2 AND col = 0;`
- Expected: 300

---

## TC_015: Deleting a Sheet with Cross-References

**Objective**: Verify that deleting a sheet that is referenced by formulas in other sheets produces an appropriate error or handling.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Ensure "Sheet1" and "Sheet2" exist
5. On "Sheet1", enter 50 in A1
6. On "Sheet2", enter `=Sheet1!A1*2` in A1
7. Attempt to delete "Sheet1"
8. Observe the response

**Expected Response**:
- One of the following behaviours:
  - A warning dialog appears: "Sheet 'Sheet1' is referenced by other sheets. Deleting it may cause errors. Are you sure?"
  - OR the deletion proceeds and the referencing formula in Sheet2 shows an error (e.g., #REF!)
- If a warning is shown, the user can choose to cancel or proceed
- If the user cancels, "Sheet1" is not deleted and all data is intact
- If the user proceeds, the formula in Sheet2 shows an appropriate error indicator

**Database Verification** (if deletion proceeds):
- Query: `SELECT name FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets') ORDER BY position;`
- Expected: "Sheet1" is not in the result set
- Query: `SELECT value, formula FROM cells WHERE sheet_id = (SELECT id FROM sheets WHERE name = 'Sheet2' AND workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets')) AND row = 0 AND col = 0;`
- Expected: formula still contains the reference, value may be NULL or an error indicator

---

## TC_016: Maximum Number of Sheets

**Objective**: Verify that the system handles a reasonable maximum number of sheets without performance degradation.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Add 20 sheets (total 21 including Sheet1)
5. Observe the tab bar
6. Click on the last tab ("Sheet21")
7. Enter data in A1 and press Enter
8. Switch back to "Sheet1"

**Expected Response**:
- All 21 tabs are visible (or horizontally scrollable)
- Switching between tabs is responsive (no noticeable lag > 1 second)
- Data entry and auto-save work correctly on all sheets
- No crash or error occurs

**Database Verification**:
- Query: `SELECT COUNT(*) FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'TestWorkbook_Sheets');`
- Expected: 21

---

## TC_017: Sheet Tab Active State Visual Indicator

**Objective**: Verify that the active sheet tab has a clear visual indicator distinguishing it from inactive tabs.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Open the workbook "TestWorkbook_Sheets"
4. Ensure at least 3 sheets exist
5. Click on "Sheet2"
6. Observe the visual state of all tabs
7. Click on "Sheet3"
8. Observe the visual state of all tabs

**Expected Response**:
- After step 6: "Sheet2" has a distinct visual style (e.g., different background colour, bold text, underline, or border) compared to "Sheet1" and "Sheet3"
- After step 8: "Sheet3" now has the active visual style, "Sheet2" reverts to inactive style
- Only one tab is ever in the active state at a time
- The active tab indicator is immediately visible without hovering

---

## TC_018: End-to-End Sheet Management Workflow

**Objective**: Verify a complete workflow of sheet management operations from creation through to persistence.

**Steps**:
1. Navigate to http://192.168.1.12:7060/
2. Log in with valid credentials
3. Create a new workbook named "E2E_SheetTest"
4. Observe: "Sheet1" is the only tab
5. Add a new sheet → "Sheet2" appears
6. Add another new sheet → "Sheet3" appears
7. Rename "Sheet2" to "Q1_Financials"
8. On "Q1_Financials", enter 1000 in A1, 2000 in A2, `=A1+A2` in A3
9. Switch to "Sheet3"
10. On "Sheet3", enter `=Q1_Financials!A3` in A1
11. Delete "Sheet3"
12. Switch to "Sheet1"
13. Refresh the browser (F5)
14. Observe the final state

**Expected Response**:
- After step 14: The tab bar shows "Sheet1" and "Q1_Financials"
- "Sheet3" is not present
- "Q1_Financials" contains the data from step 8
- The workbook name in the title bar is "E2E_SheetTest"
- All operations persisted correctly through the refresh

**Database Verification**:
- Query: `SELECT name FROM sheets WHERE workbook_id = (SELECT id FROM workbooks WHERE name = 'E2E_SheetTest') ORDER BY position;`
- Expected: "Sheet1", "Q1_Financials" (Sheet3 is absent)
- Query: `SELECT value FROM cells WHERE sheet_id = (SELECT id FROM sheets WHERE name = 'Q1_Financials' AND workbook_id = (SELECT id FROM workbooks WHERE name = 'E2E_SheetTest')) AND row = 2 AND col = 0;`
- Expected: 3000