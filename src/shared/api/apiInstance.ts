import createFetchClient, { type Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";

import type { DeepOptionalKey } from "@/shared/types";
import {
  LOCAL_STORAGE_VARIABLES,
  getLocalStorage,
  removeLocalStorage,
} from "@/shared/lib/local-storage";

import { CONFIG } from "../constants/config";

import type { paths } from "./apiTypes";

const authMiddleware: Middleware = {
  onRequest({ request }) {
    const token = getLocalStorage(LOCAL_STORAGE_VARIABLES.TOKEN);

    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }

    return request;
  },
  onResponse({ response }) {
    if (response.status === 401) {
      removeLocalStorage(LOCAL_STORAGE_VARIABLES.TOKEN);
      throw new Error("Unauthorized");
    }
  },
};

export const fetchClient = createFetchClient<DeepOptionalKey<paths, "header">>({
  baseUrl: CONFIG.BASE_API_URL,
});
fetchClient.use(authMiddleware);

export const $api = createClient(fetchClient);
