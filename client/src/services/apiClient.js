import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const formatApiError = (error) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const message = data?.message || data?.error || error.message || "Unexpected error";
    return {
      message,
      status,
      details: data?.errors,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, status: 0 };
  }

  return { message: "Unexpected error", status: 0 };
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(formatApiError(error))
);

export default apiClient;
