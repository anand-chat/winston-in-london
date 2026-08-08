// localStorage wrapper. Safari private mode throws — guard everything.
export function storageGet(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

export function storageSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* degrade silently */ }
}
