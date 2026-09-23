-- Schema for Sheets Application
-- Unified DDL covering all entities identified from TC_01 through TC_06
-- Target: PostgreSQL

-- ============================================================
-- USERS (TC_01: Authentication)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SESSIONS (TC_01: Authentication, TC_06: Persistence)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(512) NOT NULL UNIQUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- ============================================================
-- WORKBOOKS (TC_02: Workbook CRUD)
-- ============================================================
CREATE TABLE IF NOT EXISTS workbooks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_workbooks_user_id ON workbooks(user_id);
CREATE INDEX IF NOT EXISTS idx_workbooks_user_deleted ON workbooks(user_id, deleted_at);

-- ============================================================
-- SHEETS (TC_05: Sheet Tab Management)
-- ============================================================
CREATE TABLE IF NOT EXISTS sheets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workbook_id UUID NOT NULL REFERENCES workbooks(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sheets_workbook_id ON sheets(workbook_id);
CREATE INDEX IF NOT EXISTS idx_sheets_workbook_position ON sheets(workbook_id, position);

-- Unique constraint: no duplicate sheet names within the same workbook
CREATE UNIQUE INDEX IF NOT EXISTS idx_sheets_workbook_name ON sheets(workbook_id, name);

-- ============================================================
-- CELLS (TC_03: Grid & Cell Editing, TC_04: Formula Support, TC_06: Auto-save)
-- ============================================================
CREATE TABLE IF NOT EXISTS cells (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_id      UUID NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
    row           INTEGER NOT NULL,
    col           INTEGER NOT NULL,
    cell_ref      VARCHAR(10) NOT NULL,
    value         TEXT,
    cell_type     VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (cell_type IN ('text', 'number', 'formula')),
    formula       TEXT,
    computed_value TEXT,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cells_sheet_id ON cells(sheet_id);
CREATE INDEX IF NOT EXISTS idx_cells_sheet_row_col ON cells(sheet_id, row, col);
CREATE INDEX IF NOT EXISTS idx_cells_sheet_ref ON cells(sheet_id, cell_ref);

-- Unique constraint: one cell per row/col within a sheet
CREATE UNIQUE INDEX IF NOT EXISTS idx_cells_sheet_row_col_unique ON cells(sheet_id, row, col);

-- ============================================================
-- TRIGGERS: Auto-update updated_at on modification
-- ============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_workbooks_updated_at
    BEFORE UPDATE ON workbooks
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_sheets_updated_at
    BEFORE UPDATE ON sheets
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_cells_updated_at
    BEFORE UPDATE ON cells
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();