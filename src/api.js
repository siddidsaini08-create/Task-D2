// Local Vite requests use the proxy. Deployment uses a separate Express URL.
export function apiUrl(path) {
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  return `${base}${path}`;
}

export async function authHeaders(user) {
  return user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
}
