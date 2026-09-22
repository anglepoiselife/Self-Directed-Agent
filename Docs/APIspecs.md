# API Specification — Sheets

## 1. Authentication

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/register` | `{"username","password"}` | 201 `{"token","username"}` |
| POST | `/api/auth/login` | `{"username","password"}` | 200 `{"token","username"}` |
| POST | `/api/auth/logout` | — (Bearer token) | 200 `{"message":"ok"}` |

All subsequent requests require `Authorization: Bearer <token>`.

---

## 2. Workbook CRUD

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/workbooks` | — | 200 `[{id,name,createdAt,updatedAt}]` |
| POST | `/api/workbooks` | `{"name"}` | 201 `{"id","name","sheets":[{"id","name"}]}` |
| GET | `/api/workbooks/{id}` | — | 200 `{"id","name","sheets":[...]}` |
| PUT | `/api/workbooks/{id}` | `{"name"}` | 200 `{"id","name","updatedAt"}` |
| DELETE | `/api/workbooks/{id}` | — | 204 |

---

## 3. Sheet Tab Management

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/workbooks/{id}/sheets` | — | 200 `[{id,name,order}]` |
| POST | `/api/workbooks/{id}/sheets` | `{"name"}` | 201 `{"id","name","order"}` |
| PUT | `/api/sheets/{id}` | `{"name"}` | 200 `{"id","name","updatedAt"}` |
| DELETE | `/api/sheets/{id}` | — | 204 (409 if last sheet) |

---

## 4. Cell Editing

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/sheets/{id}/cells` | — | 200 `[{row,col,value}]` |
| PUT | `/api/sheets/{id}/cells` | `[{row,col,value}]` | 200 `[{row,col,value,computedValue}]` |

**Cell value rules:**
- Plain text: `"hello"`
- Number: `123.45`
- Formula: `"=SUM(A1:A10)"`, `"=A1+B2"`, `"=AVERAGE(C1:C5)"`
- Empty: `""`

---

## 5. Formula Support

Formula evaluation is server-side. Supported functions:
`SUM, AVERAGE, MIN, MAX, COUNT, IF, CONCAT, ABS, SQRT, POWER, ROUND`

Cross-sheet refs: `=Sheet2!A1+B2`

Error responses in `computedValue`: `"#DIV/0!"`, `"#VALUE!"`, `"#REF!"`

---

## 6. WebSocket / STOMP

| Channel | Direction | Payload |
|---------|-----------|---------|
| `/ws/subscribe/{workbookId}` | Client→Server | Subscribe to workbook events |
| `/ws/cell/update` | Server→Client | `{"sheetId","row","col","value","computedValue","userId"}` |
| `/ws/sheet/added` | Server→Client | `{"workbookId","sheetId","name","order"}` |
| `/ws/sheet/removed` | Server→Client | `{"workbookId","sheetId"}` |
| `/ws/sheet/renamed` | Server→Client | `{"workbookId","sheetId","name"}` |

Client publishes cell changes via REST PUT; server broadcasts to all subscribers via `/ws/cell/update`.

---

## 7. Health

| Method | Path | Response |
|--------|------|----------|
| GET | `/ws/health` | 200 `{"status":"UP"}` |

---

## 8. Error Responses

| Status | Body |
|--------|------|
| 400 | `{"error":"validation","message":"..."}` |
| 401 | `{"error":"unauthorized"}` |
| 403 | `{"error":"forbidden"}` |
| 404 | `{"error":"not_found"}` |
| 409 | `{"error":"conflict","message":"..."}` |
| 422 | `{"error":"unprocessable","message":"..."}` |