// =============================================================================
// TypeScript interfaces matching Java DTOs in backend/src/main/java/com/sheets/dto/
// All enum-like fields use uppercase string literals for seamless JSON serialization
// =============================================================================

// --- Enums ---

export type CellType = 'text' | 'number' | 'formula';

export type AuthAction = 'LOGIN' | 'REGISTER';

// --- Auth ---

export interface AuthRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}

// --- Workbook ---

export interface WorkbookDTO {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkbookCreateRequest {
  name: string;
}

export interface WorkbookUpdateRequest {
  name: string;
}

// --- Sheet ---

export interface SheetDTO {
  id: string;
  name: string;
  workbookId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SheetCreateRequest {
  name: string;
}

export interface SheetUpdateRequest {
  name: string;
}

// --- Cell ---

export interface CellDTO {
  id: string;
  sheetId: string;
  row: number;
  col: number;
  value: string;
  formula: string | null;
  cellType: CellType;
  computedValue: string | null;
  updatedAt: string;
}

export interface CellUpdateRequest {
  row: number;
  col: number;
  value: string;
  cellType: string;
  formula: string | null;
}
// --- WebSocket / STOMP Messages ---

export interface CellUpdateMessage {
  workbookId: string;
  sheetId: string;
  row: number;
  column: number;
  value: string;
  formula: string | null;
  cellType: CellType;
  userId: string;
}

export interface SheetAddedMessage {
  workbookId: string;
  sheetId: string;
  name: string;
  userId: string;
}

export interface SheetRemovedMessage {
  workbookId: string;
  sheetId: string;
  userId: string;
}

export interface SheetRenamedMessage {
  workbookId: string;
  sheetId: string;
  oldName: string;
  newName: string;
  userId: string;
}

// --- Common ---

export interface ErrorResponse {
  message: string;
  status: number;
}

export interface HealthResponse {
  status: string;
}