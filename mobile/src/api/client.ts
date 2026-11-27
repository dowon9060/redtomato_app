import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const LOCAL_HOST =
  Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${LOCAL_HOST}:8787`;

const TOKEN_KEY = "rt_auth_token";

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string | null) {
  if (!token) {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.auth !== false) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      (data as { error?: string }).error ?? "요청에 실패했어요.",
      res.status
    );
  }
  return data as T;
}
