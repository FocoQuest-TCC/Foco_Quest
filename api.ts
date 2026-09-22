export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:6900';

export const publicApiHeaders: HeadersInit = {
	'bypass-tunnel-reminder': 'true',
};
export function getAuthToken(): string | null {
	return localStorage.getItem('authToken');
}

export function getStoredUser(): { UserID?: number; name?: string; email?: string } | null {
	try {
		const user = localStorage.getItem('user');
		return user ? JSON.parse(user) : null;
	} catch {
		return null;
	}
}

export function authHeaders(): HeadersInit {
	const token = getAuthToken();
	return token
		? { ...publicApiHeaders, Authorization: `Bearer ${token}` }
		: publicApiHeaders;
}
