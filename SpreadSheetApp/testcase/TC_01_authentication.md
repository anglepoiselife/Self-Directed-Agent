# TC_01: Authentication

**Functional Group:** Authentication & Session Management  
**Architecture:** Frontend (React/Vite) → Backend (Spring Boot, port 7060) → PostgreSQL (port 5432)  
**Base URL:** http://192.168.1.12:7060/  
**Health Check:** GET /ws/health → {"status":"UP"}

---

## TC_001 – Unauthenticated Access Redirects to Login

**Precondition:** No active session (clear all cookies, use incognito/private browsing window).  
**Action:** Navigate to `http://192.168.1.12:7060/` in the browser.  
**Expected Response:**
- Browser is redirected to `/login` (URL changes to `http://192.168.1.12:7060/login`).
- The login page is rendered with:
  - A heading or title containing "Sign In" or "Log In".
  - An email/username input field.
  - A password input field (masked).
  - A "Sign In" / "Log In" submit button.
  - A link or button for "Create Account" / "Register" / "Sign Up".
  - A "Forgot Password" link.
- No workbook list or spreadsheet grid is visible.
- HTTP status code for the initial request is 302 (redirect) or the SPA router handles the redirect client-side.

**Persistence Check:** N/A (no data created).

---

## TC_002 – Login Page Visual Integrity

**Precondition:** Unauthenticated session.  
**Action:** Navigate to `http://192.168.1.12:7060/login`.  
**Expected Response:**
- Page renders without layout errors or overlapping elements.
- The following elements are present and visible:
  - Application logo or name "Sheets" in the header or above the form.
  - Email input field with placeholder or label "Email".
  - Password input field with placeholder or label "Password" (type="password", content masked).
  - A visible "Sign In" button (enabled state).
  - A "Create Account" or "Register" link/button.
  - A "Forgot Password" link.
- The page is responsive: resizing the browser window to 320px width does not cause horizontal scroll or broken layout.
- No console errors in the browser developer tools (Network tab shows no 4xx/5xx responses for the initial page load).

**Persistence Check:** N/A.

---

## TC_003 – Successful Login with Valid Credentials

**Precondition:** A user account exists in the database (email: `testuser@example.com`, password: `Test@1234`).  
**Action:**
1. Navigate to `http://192.168.1.12:7060/login`.
2. Type `testuser@example.com` into the email field.
3. Type `Test@1234` into the password field.
4. Click the "Sign In" button.
**Expected Response:**
- The page transitions to the main workbook list view (URL becomes `http://192.168.1.12:7060/` or `http://192.168.1.12:7060/workbooks`).
- The workbook list is displayed (empty list or list of existing workbooks).
- A "Create Workbook" button is visible.
- The user's email or name is displayed in a header/navbar (e.g., top-right corner).
- A "Log Out" option is accessible (button, dropdown, or menu item).
- No error messages are displayed.

**Persistence Check:**
- Query PostgreSQL: `SELECT id, email, created_at FROM users WHERE email = 'testuser@example.com';`
- Verify the user record exists and `last_login_at` (or equivalent timestamp) is updated to approximately the current time.

---

## TC_004 – Failed Login with Incorrect Password

**Precondition:** A user account exists (email: `testuser@example.com`, password: `Test@1234`).  
**Action:**
1. Navigate to `http://192.168.1.12:7060/login`.
2. Type `testuser@example.com` into the email field.
3. Type `WrongPassword99` into the password field.
4. Click the "Sign In" button.
**Expected Response:**
- The page remains on `/login` (no redirect to the workbook list).
- An error message is displayed, e.g., "Invalid email or password" or "Incorrect password".
- The error message is styled distinctly (e.g., red text, alert box).
- The email field retains the entered value.
- The password field is cleared or shows the incorrect value (implementation-dependent, but the field should not be blank if the user re-types).
- The "Sign In" button returns to its enabled state after the error is shown.

**Persistence Check:**
- Query PostgreSQL: `SELECT failed_login_attempts FROM users WHERE email = 'testuser@example.com';` (if such a column exists).
- Verify the attempt count has incremented by 1 (if the system tracks failed attempts).

---

## TC_005 – Failed Login with Non-Existent Email

**Precondition:** No user with email `nonexistent@example.com` exists.  
**Action:**
1. Navigate to `http://192.168.1.12:7060/login`.
2. Type `nonexistent@example.com` into the email field.
3. Type `AnyPassword123` into the password field.
4. Click the "Sign In" button.
**Expected Response:**
- The page remains on `/login`.
- An error message is displayed, e.g., "Invalid email or password" or "No account found with this email".
- The error message does NOT reveal whether the email exists in the system (security best practice: generic error).
- No redirect to the workbook list occurs.

**Persistence Check:**
- Query PostgreSQL: `SELECT * FROM users WHERE email = 'nonexistent@example.com';`
- Verify no record exists (confirming the email was never created).

---

## TC_006 – Account Creation (Registration) – Successful

**Precondition:** No user with email `newuser@example.com` exists.  
**Action:**
1. Navigate to `http://192.168.1.12:7060/login`.
2. Click the "Create Account" / "Register" / "Sign Up" link or button.
3. The registration form is displayed.
4. Type `newuser@example.com` into the email field.
5. Type `NewUser@2026` into the password field.
6. Type `NewUser@2026` into the confirm password field.
7. Click the "Create Account" / "Register" / "Sign Up" button.
**Expected Response:**
- The user is logged in automatically (or redirected to a "Registration Successful" page with a link to log in).
- The workbook list view is displayed (empty, since no workbooks exist yet).
- A "Create Workbook" button is visible.
- No error messages are displayed.

**Persistence Check:**
- Query PostgreSQL: `SELECT id, email, password_hash, created_at FROM users WHERE email = 'newuser@example.com';`
- Verify:
  - A record exists with the correct email.
  - `password_hash` is NOT the plaintext `NewUser@2026` (it must be a hashed value, e.g., BCrypt).
  - `created_at` is approximately the current timestamp.

---

## TC_007 – Account Creation with Duplicate Email

**Precondition:** A user with email `testuser@example.com` already exists.  
**Action:**
1. Navigate to `http://192.168.1.12:7060/register` (or click "Create Account" from the login page).
2. Type `testuser@example.com` into the email field.
3. Type `AnotherPass@2026` into the password field.
4. Type `AnotherPass@2026` into the confirm password field.
5. Click the "Create Account" / "Register" button.
**Expected Response:**
- The registration form remains visible (no redirect to the workbook list).
- An error message is displayed, e.g., "An account with this email already exists" or "Email is already registered".
- The email field retains the entered value.
- The password fields may be cleared.
- No new user record is created.

**Persistence Check:**
- Query PostgreSQL: `SELECT COUNT(*) FROM users WHERE email = 'testuser@example.com';`
- Verify the count is still 1 (no duplicate record was created).

---

## TC_008 – Account Creation with Invalid Email Format

**Precondition:** Unauthenticated session.  
**Action:**
1. Navigate to the registration page.
2. Type `notanemail` into the email field.
3. Type `ValidPass@2026` into the password field.
4. Type `ValidPass@2026` into the confirm password field.
5. Click the "Create Account" / "Register" button.
**Expected Response:**
- The registration form remains visible.
- A validation error is displayed on or near the email field, e.g., "Please enter a valid email address".
- The form does not submit (no network POST request to the backend, or the backend returns 400 Bad Request).
- The "Create Account" button may be disabled until the email is valid (client-side validation).

**Persistence Check:**
- Query PostgreSQL: `SELECT * FROM users WHERE email = 'notanemail';`
- Verify no record exists.

---

## TC_009 – Account Creation with Weak Password

**Precondition:** Unauthenticated session.  
**Action:**
1. Navigate to the registration page.
2. Type `weakuser@example.com` into the email field.
3. Type `123` into the password field.
4. Type `123` into the confirm password field.
5. Click the "Create Account" / "Register" button.
**Expected Response:**
- The registration form remains visible.
- A validation error is displayed, e.g., "Password must be at least 8 characters long" or "Password is too weak".
- The form does not successfully submit.
- No new user record is created.

**Persistence Check:**
- Query PostgreSQL: `SELECT * FROM users WHERE email = 'weakuser@example.com';`
- Verify no record exists.

---

## TC_010 – Account Creation with Mismatched Password Confirmation

**Precondition:** Unauthenticated session.  
**Action:**
1. Navigate to the registration page.
2. Type `mismatch@example.com` into the email field.
3. Type `CorrectPass@2026` into the password field.
4. Type `DifferentPass@2026` into the confirm password field.
5. Click the "Create Account" / "Register" button.
**Expected Response:**
- The registration form remains visible.
- A validation error is displayed, e.g., "Passwords do not match" or "Password confirmation does not match".
- The form does not successfully submit.
- No new user record is created.

**Persistence Check:**
- Query PostgreSQL: `SELECT * FROM users WHERE email = 'mismatch@example.com';`
- Verify no record exists.

---

## TC_011 – Session Persistence Across Page Refresh

**Precondition:** User `testuser@example.com` is logged in and viewing the workbook list.  
**Action:**
1. Navigate to `http://192.168.1.12:7060/` (workbook list is visible).
2. Press F5 or click the browser refresh button.
**Expected Response:**
- The page reloads and the workbook list is still displayed (the user remains logged in).
- The URL does not redirect to `/login`.
- The user's name/email is still displayed in the header.
- No "session expired" or "please log in again" message is shown.

**Persistence Check:**
- Query PostgreSQL: Verify the user's session record (if sessions are stored in DB) or check that a session cookie/token is present in the browser's cookie storage.

---

## TC_012 – Session Persistence Across Browser Close and Reopen

**Precondition:** User `testuser@example.com` is logged in. A "Remember Me" checkbox is present on the login form and was checked during login (or the system uses persistent tokens).  
**Action:**
1. Log in to the application.
2. Close the browser window entirely.
3. Reopen the browser and navigate to `http://192.168.1.12:7060/`.
**Expected Response:**
- If "Remember Me" was checked: the user is still logged in and sees the workbook list.
- If "Remember Me" was NOT checked: the user is redirected to `/login` (session expired).
- The behavior must be consistent and match the "Remember Me" state.

**Persistence Check:**
- If persistent: Query PostgreSQL for the user's session/token record and verify it has a future expiry date.
- If non-persistent: Verify no active session exists in the database.

---

## TC_013 – Logout

**Precondition:** User `testuser@example.com` is logged in and viewing the workbook list.  
**Action:**
1. Click the "Log Out" button (or select "Log Out" from the user menu/dropdown).
**Expected Response:**
- The user is redirected to `/login` (or the root `/` redirects to `/login`).
- The workbook list is no longer visible.
- The login form is displayed.
- The user's name/email is no longer displayed in the header.
- A "Log Out" option is no longer accessible.

**Persistence Check:**
- Query PostgreSQL: `SELECT * FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@example.com') AND is_active = true;`
- Verify no active session exists (or the session token has been invalidated).

---

## TC_014 – Accessing Protected Route After Logout

**Precondition:** User has just logged out (TC_013).  
**Action:**
1. After logout, manually navigate to `http://192.168.1.12:7060/workbooks` in the browser address bar.
**Expected Response:**
- The browser is redirected to `/login`.
- The workbook list is NOT displayed.
- No data from the user's workbooks is visible.
- The login page is rendered.

**Persistence Check:** N/A (verifies client-side routing and/or server-side auth check).

---

## TC_015 – Password Visibility Toggle

**Precondition:** Unauthenticated session, on the login page.  
**Action:**
1. Navigate to `http://192.168.1.12:7060/login`.
2. Type `Test@1234` into the password field (characters should be masked as dots or asterisks).
3. Click the eye icon or "Show Password" toggle next to the password field.
**Expected Response:**
- The password characters become visible as plain text (`Test@1234`).
- Clicking the toggle again hides the password (characters are masked again).
- The toggle does not clear or alter the password value.

**Persistence Check:** N/A.

---

## TC_016 – Forgot Password / Password Reset Flow

**Precondition:** A user with email `testuser@example.com` exists.  
**Action:**
1. Navigate to `http://192.168.1.12:7060/login`.
2. Click the "Forgot Password" link.
3. Type `testuser@example.com` into the email field on the reset page.
4. Click the "Send Reset Link" / "Reset Password" button.
**Expected Response:**
- A success message is displayed, e.g., "If an account exists with this email, a password reset link has been sent".
- The message does NOT confirm whether the email exists (security best practice).
- The page may redirect back to `/login` or show a confirmation screen.

**Persistence Check:**
- Query PostgreSQL: `SELECT * FROM password_reset_tokens WHERE email = 'testuser@example.com' ORDER BY created_at DESC LIMIT 1;`
- Verify a reset token record exists with a recent `created_at` timestamp and an unexpired `expires_at`.

---

## TC_017 – Session Expiry / Timeout

**Precondition:** User `testuser@example.com` is logged in. The session timeout is configured (e.g., 30 minutes of inactivity).  
**Action:**
1. Log in to the application.
2. Wait for the session to expire (or simulate by manually deleting the session cookie/token).
3. Attempt to interact with the application (click a button, navigate to a new page, or refresh).
**Expected Response:**
- The user is redirected to `/login`.
- A message may be displayed, e.g., "Your session has expired. Please log in again."
- No workbook data or spreadsheet content is accessible.
- The login form is displayed.

**Persistence Check:**
- Query PostgreSQL: Verify the session record for the user is marked as expired or inactive.

---

## TC_018 – Concurrent Session Handling

**Precondition:** User `testuser@example.com` is logged in on Browser A.  
**Action:**
1. On Browser B (different device or incognito window), navigate to `http://192.168.1.12:7060/login`.
2. Log in with the same credentials (`testuser@example.com` / `Test@1234`).
3. Return to Browser A and attempt to interact with the application (click a button or refresh).
**Expected Response:**
- At least one of the following behaviors occurs (implementation-dependent, but must be consistent):
  - **Option A (Single Session):** Browser A is logged out and redirected to `/login` when Browser B logs in.
  - **Option B (Multi Session):** Both Browser A and Browser B remain logged in and functional.
- The behavior must not cause data corruption or inconsistent state.

**Persistence Check:**
- Query PostgreSQL: `SELECT * FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@example.com') AND is_active = true;`
- Verify the number of active sessions matches the chosen behavior (1 for single-session, 2 for multi-session).

---

## TC_019 – Login with Leading/Trailing Whitespace in Email

**Precondition:** A user with email `testuser@example.com` exists (no whitespace in the stored email).  
**Action:**
1. Navigate to `http://192.168.1.12:7060/login`.
2. Type `  testuser@example.com  ` (with leading and trailing spaces) into the email field.
3. Type `Test@1234` into the password field.
4. Click the "Sign In" button.
**Expected Response:**
- The login succeeds (the system trims whitespace before validating).
- The user is redirected to the workbook list.
- No "invalid email" error is displayed.

**Persistence Check:**
- Query PostgreSQL: `SELECT email FROM users WHERE email = 'testuser@example.com';`
- Verify the stored email has no leading/trailing whitespace.

---

## TC_020 – Login with Uppercase Email (Case Insensitivity)

**Precondition:** A user with email `testuser@example.com` exists (stored in lowercase).  
**Action:**
1. Navigate to `http://192.168.1.12:7060/login`.
2. Type `TESTUSER@EXAMPLE.COM` into the email field.
3. Type `Test@1234` into the password field.
4. Click the "Sign In" button.
**Expected Response:**
- The login succeeds (email comparison is case-insensitive).
- The user is redirected to the workbook list.
- No "invalid email" error is displayed.

**Persistence Check:**
- Query PostgreSQL: `SELECT email FROM users WHERE LOWER(email) = 'testuser@example.com';`
- Verify exactly one record is returned.

---

## Summary Table

| TC ID | Category | Description |
|-------|----------|-------------|
| TC_001 | Redirect | Unauthenticated access redirects to login |
| TC_002 | UI | Login page visual integrity |
| TC_003 | Login | Successful login with valid credentials |
| TC_004 | Login | Failed login with incorrect password |
| TC_005 | Login | Failed login with non-existent email |
| TC_006 | Registration | Successful account creation |
| TC_007 | Registration | Duplicate email rejection |
| TC_008 | Registration | Invalid email format validation |
| TC_009 | Registration | Weak password rejection |
| TC_010 | Registration | Password confirmation mismatch |
| TC_011 | Session | Persistence across page refresh |
| TC_012 | Session | Persistence across browser close/reopen |
| TC_013 | Session | Logout |
| TC_014 | Redirect | Protected route access after logout |
| TC_015 | UI | Password visibility toggle |
| TC_016 | Password | Forgot password / reset flow |
| TC_017 | Session | Session expiry / timeout |
| TC_018 | Session | Concurrent session handling |
| TC_019 | Login | Whitespace trimming in email |
| TC_020 | Login | Case-insensitive email matching |