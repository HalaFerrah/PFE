const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function register(payload) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMe(token) {
  return request("/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function createBoat(token, payload) {
  return request("/boats", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export { API_BASE_URL };
