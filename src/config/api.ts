
import type { CharacterId } from './characters';

const defaultApiUrl = import.meta.env.PROD ? 'https://backend-novo-7b5146iad-foco-quest3.vercel.app' : 'http://localhost:6900';

export const API_URL = (import.meta.env.VITE_API_URL?.trim() || defaultApiUrl).replace(/\/+$/, '');

export const SESSION_EVENT = 'focoquest:session-changed';

export const publicApiHeaders: HeadersInit = {
  	'bypass-tunnel-reminder': 'true',
};

export interface StoredUser {
	UserID: number;
	name?: string;
	email?: string;
	characterId?: CharacterId | null;
	experience?: number;
}

function asStoredUser(value: unknown): StoredUser | null {
  	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
  	  return null;
  	}
  
  	const user = value as Record<string, unknown>;
  
  	if (typeof user.UserID !== 'number' ||!Number.isSafeInteger(user.UserID) ||user.UserID <= 0) {
  	  return null;
  	}
  
  	return value as StoredUser;
}

export function getStoredUser(): StoredUser | null {
  	try {
  	  const saved = localStorage.getItem('user');

  	  if (!saved) return null;

  	  return asStoredUser(JSON.parse(saved));
  	} catch {
  	  return null;
  	}
}

export function getAuthToken(): string | null {
  	const token = localStorage.getItem('authToken')?.trim();

  	return token || null;
}

export function isJwtExpired(token: string): boolean {
  	try {
  	  const parts = token.split('.');

  	  if (parts.length !== 3) return false;

  	  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  	  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  	  const payload: unknown = JSON.parse(atob(padded));

  	  if (typeof payload !== 'object' || payload === null) {
  	    return false;
  	  }

  	  const exp = (payload as { exp?: unknown }).exp;

  	  return (typeof exp === 'number' && Number.isFinite(exp) && Date.now() >= exp * 1000);
  	} catch {
  	  return false;
  	}
}

export function hasSession(): boolean {
  	const token = getAuthToken();
  	const user = getStoredUser();

  	return Boolean(token && user && !isJwtExpired(token));
}

export function clearSession(): void {
  	localStorage.removeItem('authToken');
  	localStorage.removeItem('user');

  	window.dispatchEvent(new Event(SESSION_EVENT));
}

export function saveSession(data: unknown): StoredUser {
	if (typeof data !== 'object' || data === null) {
    	throw new Error('O servidor retornou uma sessão inválida.');
  	}

  	const session = data as Record<string, unknown>;
  	const user = asStoredUser(session.user);

  	if (typeof session.token !== 'string' || !session.token.trim() || !user) {
  	  throw new Error('O servidor não retornou um token e usuário válidos.');
  	}

  	if (isJwtExpired(session.token)) {
  	  throw new Error('O servidor retornou um token expirado.');
  	}

  	localStorage.setItem('user', JSON.stringify(user));
  	localStorage.setItem('authToken', session.token);

  	window.dispatchEvent(new Event(SESSION_EVENT));

  	return user;
}

export function authHeaders(): HeadersInit {
  	const token = getAuthToken();

  	return token ? {...publicApiHeaders, Authorization: `Bearer ${token}`,} : publicApiHeaders;
}

export class SessionExpiredError extends Error {
  	constructor() {
  	  super('Sua sessão expirou. Faça login novamente.');

  	  this.name = 'SessionExpiredError';
  	}
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
	const token = getAuthToken();

  	if (!token || isJwtExpired(token)) {
  	  clearSession();
  	  throw new SessionExpiredError();
  	}

  	const headers = new Headers(options.headers);

  	headers.set('Authorization', `Bearer ${token}`);
  	headers.set('bypass-tunnel-reminder', 'true');

  	const response = await fetch(url, {
  	  ...options,
  	  headers,
  	});

  	if (response.status === 401) {
  	  if (getAuthToken() === token) {
  	    clearSession();
  	  }

  	  throw new SessionExpiredError();
  	}

  	return response;
}