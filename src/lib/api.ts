/** Thin wrapper around the JSON API. Cookies carry the session, so every
 * request is sent with credentials and a failed call throws a message that is
 * safe to show the user. */

let authToken = typeof localStorage !== 'undefined' ? localStorage.getItem('ve_session_token') || '' : '';

export function setAuthToken(token: string | null) {
  authToken = token || '';
  if (typeof localStorage !== 'undefined') {
    if (token) localStorage.setItem('ve_session_token', token);
    else localStorage.removeItem('ve_session_token');
  }
}

export function getAuthToken(): string {
  return authToken;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    response = await fetch(`/api/${path}`, {
      credentials: 'same-origin',
      ...init,
      headers,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 0);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== 'auth/login' && path !== 'auth/me') {
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    throw new ApiError((payload as any)?.error || `Request failed (${response.status}).`, response.status);
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
