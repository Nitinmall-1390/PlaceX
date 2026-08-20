const isBrowser = typeof window !== 'undefined';

export function getStorage(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorage(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function removeStorage(key: string): void {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function clearStorage(): void {
  if (!isBrowser) return;
  try {
    localStorage.clear();
  } catch {
    // ignore
  }
}
