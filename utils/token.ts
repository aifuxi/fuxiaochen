const TOKEN_KEY = "fxc.token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  return localStorage.setItem(TOKEN_KEY, token);
}

export function cleanToken() {
  return localStorage.removeItem(TOKEN_KEY);
}
