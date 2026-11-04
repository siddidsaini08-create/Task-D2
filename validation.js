// Keep validation on the server even though the React form validates too.
export function validateEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || !/^[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(email) || email.includes('..')) return null;
  // No line breaks or control characters are allowed in mail headers.
  if (/[\x00-\x1F\x7F]/.test(email)) return null;
  return email;
}

export function validateContact(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const email = validateEmail(body.email);
  if (!name || name.length > 100 || !message || message.length > 2000 || !email) return null;
  return { name, email, message };
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
