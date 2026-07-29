const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Request Failed with status ${response.status}`);
  }

  return response.json();
}

export const apiFetch = fetchAPI;

type LoginResponse = {
  access_token: string;
  token_type: string;
};

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  const data = (await fetchAPI("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ username, password }).toString(),
  })) as LoginResponse;

  if (typeof window !== "undefined" && data?.access_token) {
    localStorage.setItem("token", data.access_token);
  }

  return data;
}
