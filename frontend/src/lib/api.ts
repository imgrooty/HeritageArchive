export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders();
  
  const mergedOptions = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  let res: Response;
  try {
    res = await fetch(url, mergedOptions);
  } catch (err: any) {
    throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure backend is running.`);
  }

  if (!res.ok) {
    let errorDetail = "Request failed";
    try {
      const data = await res.json();
      errorDetail = data.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }
  return res.json();
}

// Custom URLSearchParams POST for FastAPI OAuth2 login compatibilities
export async function loginUser(username: string, password: string) {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
  } catch (err: any) {
    throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please ensure backend is running.`);
  }
  
  if (!res.ok) {
    let errorDetail = "Authentication failed";
    try {
      const data = await res.json();
      errorDetail = data.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }
  const data = await res.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("token", data.access_token);
  }
  return data;
}

// Custom Multipart Form Data POST for image uploads
export async function uploadMedia(siteId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  const res = await fetch(`${API_BASE_URL}/heritage/${siteId}/media`, {
    method: "POST",
    headers,
    body: formData,
  });
  
  if (!res.ok) {
    let errorDetail = "Upload failed";
    try {
      const data = await res.json();
      errorDetail = data.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }
  return res.json();
}

export async function deleteMedia(siteId: number, mediaId: number) {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}/heritage/${siteId}/media/${mediaId}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    let errorDetail = "Delete media failed";
    try {
      const data = await res.json();
      errorDetail = data.detail || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }
  return res.json();
}
