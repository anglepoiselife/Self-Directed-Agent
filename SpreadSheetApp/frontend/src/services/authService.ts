import { AuthRequest, AuthResponse } from '../types';

const BASE_URL = '';

export async function login(request: AuthRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

export async function register(request: AuthRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const data: AuthResponse = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function clearToken(): void {
  localStorage.removeItem('token');
}