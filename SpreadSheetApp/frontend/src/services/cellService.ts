import { CellDTO, CellUpdateRequest } from '../types';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchCells(sheetId: string): Promise<CellDTO[]> {
  const res = await fetch(`/sheets/${sheetId}/cells`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cells: ${res.status}`);
  }
  return res.json();
}

export async function updateCell(
  sheetId: string,
  row: number,
  col: number,
  value: string,
  cellType: string,
  formula: string | null
): Promise<CellDTO> {
  const body: CellUpdateRequest = { row, col, value, cellType, formula };
  const res = await fetch(`/sheets/${sheetId}/cells`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify([body]),
  });
  if (!res.ok) {
    throw new Error(`Failed to update cell: ${res.status}`);
  }
  const cells: CellDTO[] = await res.json();
  const match = cells.find((c) => c.row === row && c.col === col);
  if (!match) {
    throw new Error(`Cell not found in response for row ${row}, col ${col}`);
  }
  return match;
}

export async function bulkUpdateCells(
  sheetId: string,
  updates: CellUpdateRequest[]
): Promise<CellDTO[]> {
  const res = await fetch(`/sheets/${sheetId}/cells/bulk`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Failed to bulk update cells: ${res.status}`);
  }
  return res.json();
}

export async function recalculateFormulas(sheetId: string): Promise<CellDTO[]> {
  const res = await fetch(`/sheets/${sheetId}/recalculate`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to recalculate formulas: ${res.status}`);
  }
  return res.json();
}