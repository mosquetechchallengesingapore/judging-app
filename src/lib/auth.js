// Simple client-side auth state management
const AUTH_STORAGE_KEY = 'judging_app_user';

export function saveAuthUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function getAuthUser() {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
