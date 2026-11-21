export const STORAGE_KEY = 'mona-bookmarks';
export const SEPARATOR = ' :: ';

export function normalizeUrl(input) {
  const trimmed = String(input ?? '').trim();
  if (!trimmed) return null;

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (!parsed.protocol || !parsed.hostname) return null;
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.href;
  } catch {
    return null;
  }
}

export function base62(value) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let number = BigInt(value);
  if (number === 0n) return '0';

  let encoded = '';
  while (number > 0n) {
    encoded = alphabet[Number(number % 62n)] + encoded;
    number = number / 62n;
  }
  return encoded;
}

export function generateSlug(seed = Date.now()) {
  const hash = [...String(seed)].reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
    2166136261,
  );
  const short = base62(hash).padStart(4, '0').slice(-4);
  return `mona-${short}`;
}

export function formatBookmark(bookmark) {
  if (!isValidBookmark(bookmark)) return '';
  return `${bookmark.url}${SEPARATOR}${bookmark.slug}`;
}

export function isValidBookmark(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.url === 'string' &&
      value.url.length > 0 &&
      typeof value.slug === 'string' &&
      /^mona-[a-zA-Z0-9]+$/.test(value.slug),
  );
}

export function loadBookmarks(rawValue) {
  if (typeof rawValue !== 'string' || rawValue.trim() === '') return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidBookmark);
  } catch {
    return [];
  }
}
