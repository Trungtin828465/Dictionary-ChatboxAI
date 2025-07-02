import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// Create a baseURL using environment variables with a fallback
const baseURL = import.meta.env.VITE_BE_API_URL || "/api";
export const api_version = "api/v1";

// Create the axios instance with default configuration
export const apiClient = axios.create({
  baseURL: `${baseURL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("authToken");
    // If token exists, add it to the headers
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Add response interceptor for common error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors (e.g., token expired)
    if (error.response?.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  },
);

// Type-safe request function
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClient(config);
    return response.data;
  } catch (error) {
    // Log the error with useful context
    console.error("API Request Failed:", {
      url: config.url,
      method: config.method,
      error:
        error instanceof AxiosError
          ? {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            }
          : error,
    });
    throw error;
  }
}

// Convenience methods for common operations
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiRequest<T>({ ...config, url, method: "GET" }),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiRequest<T>({ ...config, url, method: "POST", data }),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiRequest<T>({ ...config, url, method: "PUT", data }),

  patch: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => apiRequest<T>({ ...config, url, method: "PATCH", data }),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiRequest<T>({ ...config, url, method: "DELETE" }),
};
const apiClientTranslation = axios.create({
  baseURL: `${import.meta.env.VITE_FASTAPI_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});
// Type-safe request function
export async function apiRequestTranslation<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClientTranslation(config);
    return response.data;
  } catch (error) {
    // Log the error with useful context
    console.error("API Request Failed:", {
      url: config.url,
      method: config.method,
      error:
        error instanceof AxiosError
          ? {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            }
          : error,
    });
    throw error;
  }
}
// api for translation
export const apiTranslation = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiRequestTranslation<T>({ ...config, url, method: "GET" }),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiRequestTranslation<T>({ ...config, url, method: "POST", data }),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiRequestTranslation<T>({ ...config, url, method: "PUT", data }),
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiRequestTranslation<T>({ ...config, url, method: "DELETE" }),
};
