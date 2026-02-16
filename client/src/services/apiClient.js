import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // Lee el token del localStorage en la estructura correcta
  try {
    const authData = localStorage.getItem("excedentes_auth");
    if (authData) {
      const parsed = JSON.parse(authData);
      const token = parsed.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn("Error reading auth token:", error);
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
