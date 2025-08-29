export type AuthResponse = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
};

const API_BASE = 'https://dummyjson.com';

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, expiresInMins: 60 }),
  });
  if (!res.ok) {
    let message = 'Login failed';
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {}
    throw new Error(message);
  }
  return await res.json() as AuthResponse;
} 