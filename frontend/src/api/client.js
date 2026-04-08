const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000/api";

function isMissingContractTableError(message = "") {
  return message.includes("insurance_contract") && message.includes("doesn't exist");
}

function isMissingContractsRouteError(message = "") {
  return message.includes("/api/contracts/mine") && message.toLowerCase().includes("not found");
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {})
      },
      ...options
    });
  } catch (error) {
    throw new Error("Backend server is unavailable. Start the API and database, then try again.");
  }

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

export function getMyBoats(token) {
  return request("/boats", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function createBoat(token, payload) {
  return request("/boats", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: payload
  });
}

export function updateBoat(token, boatId, payload) {
  return request(`/boats/${boatId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export function deleteBoat(token, boatId) {
  return request(`/boats/${boatId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function simulatePremium(payload) {
  return request("/devis/calculer", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function createContract(token, payload) {
  try {
    return await request("/contracts/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    if (isMissingContractTableError(error.message)) {
      throw new Error("Contracts are not available yet because the contract table is missing in the database.");
    }
    throw error;
  }
}

export async function getMyContracts(token) {
  try {
    return await request("/contracts/mine", {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    if (isMissingContractTableError(error.message) || isMissingContractsRouteError(error.message)) {
      return { data: [] };
    }
    throw error;
  }
}

export async function getContractDetail(token, contractId) {
  try {
    return await request(`/contracts/${contractId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    if (isMissingContractTableError(error.message)) {
      return { data: null };
    }
    throw error;
  }
}

export async function getAdminContracts(token) {
  try {
    return await request("/contracts/admin/all", {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    if (isMissingContractTableError(error.message)) {
      return { data: [] };
    }
    throw error;
  }
}

export async function getAdminClients(token) {
  try {
    return await request("/contracts/admin/clients", {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    if (isMissingContractTableError(error.message)) {
      return { data: [] };
    }
    throw error;
  }
}

export async function updateContractStatus(token, contractId, status) {
  try {
    return await request(`/contracts/${contractId}/status`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
  } catch (error) {
    if (isMissingContractTableError(error.message)) {
      throw new Error("Contracts are not available yet because the contract table is missing in the database.");
    }
    throw error;
  }
}

export { API_BASE_URL };
