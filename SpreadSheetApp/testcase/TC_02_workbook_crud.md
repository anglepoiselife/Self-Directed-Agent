# TC_02: Workbook CRUD

**Functional Group:** Workbook listing, creation, deletion, and opening from the root page.
**Architecture:** React/Vite frontend → Spring Boot REST/WebSocket → PostgreSQL (port 5432)
**Base URL:** http://192.168.1.12:7060/

---

## TC_001 – Root page displays an empty workbook list for a new user

**Precondition:** User is authenticated (logged in via TC_01). No workbooks have been created.

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Observe the main content area.

**Expected Result:**
- The page displays a heading or title indicating "Workbooks" or similar.
- An empty state message is shown (e.g., "No workbooks yet" or "Create your first workbook").
- A "Create" button (or equivalent) is visible.
- No workbook cards, rows, or list items are present.
- The page does not show any other user's workbooks.

---

## TC_002 – Creating a new workbook from the root page

**Precondition:** User is authenticated. The workbook list is empty.

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Click the "Create" button (or equivalent action to create a new workbook).
3. Observe the UI response.

**Expected Result:**
- A new workbook is created (either immediately with a default name like "Untitled" or via a prompt/dialog asking for a name).
- If a dialog appears: it contains a text input for the workbook name and a confirm/cancel action.
- After creation, the new workbook appears in the workbook list on the root page.
- The workbook list is no longer in an empty state.
- The workbook is persisted in the database (verifiable via a subsequent page reload).

---

## TC_003 – Creating a workbook with a custom name

**Precondition:** User is authenticated. The workbook list may contain existing workbooks.

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Click the "Create" button.
3. If a dialog/prompt appears, type "My Budget 2026" into the name field.
4. Confirm the creation (click "Create", "OK", or press Enter).

**Expected Result:**
- A new workbook named "My Budget 2026" appears in the workbook list.
- The name is displayed exactly as entered.
- The workbook is persisted in the database (survives page reload).

---

## TC_004 – Creating multiple workbooks

**Precondition:** User is authenticated. At least one workbook already exists.

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Click "Create" and name the workbook "Sales Q1".
3. Click "Create" again and name the workbook "Sales Q2".
4. Click "Create" again and name the workbook "Tax Filing".

**Expected Result:**
- All three workbooks appear in the list: "Sales Q1", "Sales Q2", "Tax Filing".
- The previously existing workbook(s) are still present.
- Each workbook is a distinct entry (not merged or duplicated).
- All are persisted in the database.

---

## TC_005 – Opening a workbook from the root page

**Precondition:** User is authenticated. At least one workbook exists (e.g., "My Budget 2026").

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Click on the workbook "My Budget 2026" in the list.

**Expected Result:**
- The page transitions to the spreadsheet view for that workbook.
- The title bar (or header) displays the workbook name "My Budget 2026".
- A grid is visible with columns A through Z and rows 1 through 32.
- The first sheet tab at the bottom is labeled "Sheet1".
- If the workbook has previously saved data, the cells are populated with that data.
- If the workbook is new/blank, all cells are empty.
- The URL changes to reflect the workbook (e.g., /workbook/{id} or similar).

---

## TC_006 – Opening a previously populated workbook restores data

**Precondition:** User has a workbook "My Budget 2026" with data entered (e.g., cell A1 = "Revenue", B1 = 1000).

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Click on "My Budget 2026".
3. Observe the grid content.

**Expected Result:**
- Cell A1 displays "Revenue".
- Cell B1 displays 1000 (or "1000").
- All previously saved data is restored exactly as it was saved.
- The data is loaded from the database (not from browser cache only).

---

## TC_007 – Deleting a workbook from the root page

**Precondition:** User is authenticated. At least one workbook exists (e.g., "Sales Q1").

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Locate the workbook "Sales Q1" in the list.
3. Click the delete button (or action) associated with "Sales Q1".
4. If a confirmation dialog appears, confirm the deletion.

**Expected Result:**
- The workbook "Sales Q1" is removed from the list.
- If a confirmation dialog appeared, canceling it would NOT delete the workbook.
- The deleted workbook is no longer accessible via its previous URL.
- The deletion is persisted in the database (the workbook does not reappear on page reload).
- Other workbooks in the list remain unaffected.

---

## TC_008 – Deleting the last remaining workbook returns to empty state

**Precondition:** User has exactly one workbook remaining.

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Delete the only remaining workbook.

**Expected Result:**
- The workbook list returns to the empty state (e.g., "No workbooks yet" message).
- The "Create" button is still visible.
- No errors or broken UI elements are displayed.

---

## TC_009 – User cannot see or access another user's workbooks

**Precondition:** Two users exist: User A (with workbooks "Alpha", "Beta") and User B (with workbooks "Gamma").

**Steps:**
1. Log in as User B.
2. Navigate to http://192.168.1.12:7060/
3. Observe the workbook list.
4. Attempt to access User A's workbook by manually navigating to its URL (e.g., /workbook/{alpha-id}).

**Expected Result:**
- The workbook list shows only "Gamma" (User B's workbook).
- "Alpha" and "Beta" are NOT visible in the list.
- Attempting to access User A's workbook URL directly results in a 403/404 or redirect to the root page (not a data leak).
- User A's data is not exposed in any form.

---

## TC_010 – Workbook list persists across page reloads

**Precondition:** User has created 3 workbooks: "Doc A", "Doc B", "Doc C".

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Observe the list shows all three workbooks.
3. Reload the page (F5 or browser refresh).

**Expected Result:**
- All three workbooks are still listed after reload.
- The order is consistent (or follows a defined sort such as by creation date or name).
- No data is lost; the list is loaded from the database, not from client-side state only.

---

## TC_011 – Creating a workbook with a duplicate name

**Precondition:** User already has a workbook named "Report".

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Click "Create".
3. Enter "Report" as the name (same as existing).
4. Confirm creation.

**Expected Result:**
- Either: a second workbook named "Report" is created (duplicate names are allowed), OR
- A validation error is shown indicating the name is already in use and the user must choose a different name.
- The existing "Report" workbook is not overwritten or modified.
- No data loss occurs to the existing workbook.

---

## TC_012 – Creating a workbook with special characters in the name

**Precondition:** User is authenticated.

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Click "Create".
3. Enter "Q4 & FY'26 – <Test>" as the name.
4. Confirm creation.

**Expected Result:**
- The workbook is created successfully with the name displayed as "Q4 & FY'26 – <Test>".
- The name is correctly rendered without HTML injection or broken characters.
- The workbook appears in the list and can be opened.
- No XSS or injection vulnerability is triggered.

---

## TC_013 – Deleting a workbook while another is open (navigation back)

**Precondition:** User has workbooks "Keep" and "Delete Me".

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Click "Delete Me" to open it.
3. Navigate back to the root page (via back button, logo click, or "Home" link).
4. Delete "Delete Me" from the list.
5. Click "Keep" to open it.

**Expected Result:**
- "Delete Me" is removed from the list after deletion.
- "Keep" is still present and opens correctly with its data intact.
- No broken references or errors occur.

---

## TC_014 – End-to-end: Create, open, edit, save, return, verify persistence

**Precondition:** User is authenticated. No workbooks exist.

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Click "Create" and name the workbook "E2E Test".
3. Click on "E2E Test" to open it.
4. In cell A1, type "Hello" and press Enter.
5. In cell B2, type 42 and press Enter.
6. Navigate back to the root page.
7. Reload the page.
8. Click "E2E Test" to reopen it.

**Expected Result:**
- After step 8: cell A1 shows "Hello" and cell B2 shows 42.
- The data was auto-saved (no explicit save action was taken).
- The full round-trip (UI → backend → database → backend → UI) is verified.
- No data is lost at any stage.

---

## TC_015 – Workbook list shows correct count and no duplicates

**Precondition:** User has created 5 workbooks with distinct names.

**Steps:**
1. Navigate to http://192.168.1.12:7060/
2. Count the number of workbook entries displayed.
3. Verify each name appears exactly once.

**Expected Result:**
- Exactly 5 workbooks are displayed.
- No duplicate entries appear.
- Each workbook has a unique identifier (even if names were duplicated, they are distinct entries).