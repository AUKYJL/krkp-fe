import createFetchClient, { type Middleware } from "openapi-fetch";
import createClient from "openapi-react-query";

import type { DeepOptionalKey } from "@/shared/types";

import { CONFIG } from "../constants/config";

import type { paths } from "./apiTypes";

const authMiddleware: Middleware = {
  onRequest() {},
  onResponse({ response }) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
  },
};

export const fetchClient = createFetchClient<DeepOptionalKey<paths, "header">>({
  baseUrl: CONFIG.BASE_API_URL,
});
fetchClient.use(authMiddleware);

export const $api = createClient(fetchClient);
