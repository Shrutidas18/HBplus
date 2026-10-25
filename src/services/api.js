import { API_BASE_URL } from '../config/env';

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request(path, idToken, { method = 'GET' } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    throw new ApiError('Network error', 0, 'network');
  }

  let body = null;
  try {
    body = await res.json();
  } catch (e) {
    // non-JSON response (e.g. an HTML fallback page); handled below
  }

  if (!res.ok) {
    throw new ApiError((body && body.message) || 'Request failed', res.status, body && body.code);
  }
  return body;
}

/** Server verifies token + domain, upserts the profile, returns it with role. */
export async function fetchProfile(idToken) {
  const body = await request('/api/me', idToken, { method: 'POST' });
  if (!body || !body.user) throw new ApiError('Unexpected response', 502, 'bad_response');
  return body.user;
}

/** Admin only (enforced on the server). */
export async function fetchUsers(idToken) {
  const body = await request('/api/users', idToken);
  if (!body || !Array.isArray(body.users)) throw new ApiError('Unexpected response', 502, 'bad_response');
  return body.users;
}
