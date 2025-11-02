// API Helper utilities

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Create headers with auth token
export function getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (includeAuth) {
    const token = getAuthToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  return headers
}

// Handle API response
export async function handleResponse<T>(response: Response): Promise<APIResponse<T>> {
  const data = await response.json()

  if (!response.ok) {
    return {
      success: false,
      error: data.error || `HTTP error! status: ${response.status}`,
    }
  }

  return data
}

// Generic API call helper
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(true),
        ...options.headers,
      },
    })

    return handleResponse<T>(response)
  } catch (error: any) {
    console.error(`API call to ${endpoint} failed:`, error)
    return {
      success: false,
      error: error.message || "Network error",
    }
  }
}

