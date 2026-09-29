export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, string[]>;

  constructor(message: string, statusCode = 500, code = "INTERNAL_SERVER_ERROR", details?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.port === "5173" ? "http://localhost:5000" : "");

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    // Try restoring token from localStorage
    try {
      this.token = localStorage.getItem("auth_token");
    } catch {
      this.token = null;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include", // for cookie authentication
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return {} as T;
      }

      // Check if CSV download
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/csv")) {
        const text = await response.text();
        return text as unknown as T;
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message = data?.message || response.statusText || "An API error occurred.";
        const code = data?.error || `HTTP_${response.status}`;
        const details = data?.details;
        throw new ApiError(message, response.status, code, details);
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      // Network or offline error
      throw new ApiError(
        err.message || "Network request failed. Is the backend server running?",
        0,
        "NETWORK_ERROR"
      );
    }
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
