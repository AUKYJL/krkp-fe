import type { QueryClient } from "@tanstack/react-query";

import { $api } from "@/shared/api/apiInstance";
import { LOCAL_STORAGE_VARIABLES } from "@/shared/lib/local-storage";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@/shared/lib/local-storage";

import type { components } from "./apiTypes";

type LoginRequest = {
  body: components["schemas"]["LoginDto"];
};

type RegisterRequest = {
  body: components["schemas"]["RegisterDto"];
};

export type CurrentUser = components["schemas"]["UsersResponseDto"];
export type AuthTokenResponse = components["schemas"]["AuthTokenResponseDto"];
type ApiError = components["schemas"]["BadResponseDto"];

export const authQueryKeys = {
  currentUser: ["get", "/api/auth/me"] as const,
};

export const getAuthToken = () => {
  return getLocalStorage(LOCAL_STORAGE_VARIABLES.TOKEN);
};

export const setAuthToken = (token: string) => {
  setLocalStorage(LOCAL_STORAGE_VARIABLES.TOKEN, token);
};

export const clearAuthToken = () => {
  removeLocalStorage(LOCAL_STORAGE_VARIABLES.TOKEN);
};

export const authMeQueryOptions = () => {
  return $api.queryOptions("get", "/api/auth/me");
};

export const ensureCurrentUser = async (queryClient: QueryClient) => {
  return queryClient.ensureQueryData(authMeQueryOptions());
};

export const invalidateCurrentUser = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
};

export const useCurrentUserQuery = (enabled = true) => {
  return $api.useQuery("get", "/api/auth/me", undefined, {
    enabled,
    retry: false,
  });
};

export const useLoginMutation = () => {
  return $api.useMutation("post", "/api/auth/login", {
    retry: false,
  });
};

export const useRegisterMutation = () => {
  return $api.useMutation("post", "/api/auth/register", {
    retry: false,
  });
};

export const createLoginPayload = (
  body: components["schemas"]["LoginDto"],
): LoginRequest => {
  return { body };
};

export const createRegisterPayload = (
  body: components["schemas"]["RegisterDto"],
): RegisterRequest => {
  return { body };
};

export const getApiErrorMessage = (error: unknown) => {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return "Не удалось выполнить запрос. Попробуйте еще раз.";
  }

  const apiError = error as ApiError;

  if (typeof apiError.message === "string" && apiError.message.length > 0) {
    return apiError.message;
  }

  return "Не удалось выполнить запрос. Попробуйте еще раз.";
};
