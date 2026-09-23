import { WorkbookDTO, WorkbookCreateRequest, WorkbookUpdateRequest } from '../types';

const API_BASE = '/workbooks';

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

export async function fetchWorkbooks(): Promise<WorkbookDTO[]> {
  const res = await fetch(API_BASE, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch workbooks: ${res.status}`);
  }
  return res.json();
}

export async function createWorkbook(name: string): Promise<WorkbookDTO> {
  const body: WorkbookCreateRequest = { name };
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to create workbook: ${res.status}`);
  }
  return res.json();
}

export async function renameWorkbook(id: string, name: string): Promise<WorkbookDTO> {
  const body: WorkbookUpdateRequest = { name };
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to rename workbook: ${res.status}`);
  }
  return res.json();
}

export async function deleteWorkbook(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete workbook: ${res.status}`);
  }
}