import { API_URL } from './utils/constants';

// small wrapper around fetch so every page doesn't repeat the headers/JSON/error stuff
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('library_token');

  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    // some responses have no body, that's fine
  }

  if (!res.ok) {
    // token expired or invalid -> AuthContext listens for this and logs out
    if (res.status === 401 && token) {
      window.dispatchEvent(new Event('library:unauthorized'));
    }
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}
