export type AuthUser = {
  id: string;
  name?: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

const API_BASE = import.meta.env.VITE_API_URL;

const request = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as { error?: string } & T;

  if (!response.ok) {
    throw new Error(data.error || "Unexpected error");
  }

  return data;
};

export const loginRequest = async (payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> => request<AuthResponse>("/api/auth/login", payload);

export const registerRequest = async (payload: {
  name?: string;
  email: string;
  password: string;
}): Promise<AuthResponse> =>
  request<AuthResponse>("/api/auth/register", payload);
