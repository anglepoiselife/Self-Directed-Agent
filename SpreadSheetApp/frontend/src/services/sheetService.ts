import { SheetDTO, SheetCreateRequest, SheetUpdateRequest } from '../types';

const API_BASE = '/sheets';

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

export async function fetchSheets(workbookId: string): Promise<SheetDTO[]> {
  const res = await fetch(`/workbooks/${workbookId}/sheets`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheets: ${res.status}`);
  }
  return res.json();
}

export async function createSheet(workbookId: string, name: string): Promise<SheetDTO> {
  const body: SheetCreateRequest = { name };
  const res = await fetch(`/workbooks/${workbookId}/sheets`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to create sheet: ${res.status}`);
  }
  return res.json();
}

export async function renameSheet(sheetId: string, name: string): Promise<SheetDTO> {
  const body: SheetUpdateRequest = { name };
  const res = await fetch(`${API_BASE}/${sheetId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to rename sheet: ${res.status}`);
  }
  return res.json();
}

export async function deleteSheet(sheetId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${sheetId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete sheet: ${res.status}`);
  }
}