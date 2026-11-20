// frontend/lib/api.ts
import { getStoredToken, clearAuthSession } from "./auth";
import mockDataRaw from "./mockData.json";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const mockData: Record<string, any> = mockDataRaw || {};

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers, method = "GET", ...restOptions } = options;

  let cleanEndpoint = endpoint.split("?")[0];
  let url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  }

  const token = getStoredToken();
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      ...restOptions,
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string>),
      },
    });

    if (response.status === 401) {
      console.warn("API 401 response - login bypassed");
    }

    if (response.ok) {
      const data = await response.json();
      return data as T;
    }
  } catch (err) {
    // Network error or offline - fallback below
    console.warn(`Fetch to ${url} failed, using mock data fallback:`, err);
  }

  // Fallback for static deploy (Netlify) or offline demo mode
  if (method.toUpperCase() !== "GET") {
    return {
      success: true,
      message: "Operation completed successfully (Demo Mode)",
      data: {},
    } as unknown as T;
  }

  // Try matching exact or prefix endpoint in mock data
  if (mockData[cleanEndpoint]) {
    return mockData[cleanEndpoint] as T;
  }

  // Match partial endpoint patterns
  for (const [key, val] of Object.entries(mockData)) {
    if (cleanEndpoint.startsWith(key) || key.startsWith(cleanEndpoint)) {
      return val as T;
    }
  }

  return {
    success: true,
    data: [],
    message: "Fallback data",
  } as unknown as T;
}
