import type { StateStorage } from 'zustand/middleware';

const REMEMBER_KEY = 'authRemember';

export function isRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_KEY) !== 'false';
}

export function setRememberMe(remember: boolean): void {
  localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
}

function activeStorage(): Storage {
  return isRememberMe() ? localStorage : sessionStorage;
}

export function getAuthItem(key: string): string | null {
  return activeStorage().getItem(key);
}

export function setAuthItem(key: string, value: string): void {
  const storage = activeStorage();
  const other = storage === localStorage ? sessionStorage : localStorage;
  storage.setItem(key, value);
  other.removeItem(key);
}

export function clearAuthItems(keys: string[]): void {
  for (const key of keys) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

export const authPersistStorage: StateStorage = {
  getItem: (name) => activeStorage().getItem(name),
  setItem: (name, value) => {
    activeStorage().setItem(name, value);
    const other = isRememberMe() ? sessionStorage : localStorage;
    other.removeItem(name);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};
