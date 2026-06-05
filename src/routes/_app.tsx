import { createFileRoute, redirect } from "@tanstack/react-router";

import { AppShellPage } from "@/pages/app-shell";
import { ensureCurrentUser, getAuthToken } from "@/shared/api/auth";

const RouteComponent = () => {
  return <AppShellPage />;
};

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context, location }) => {
    if (!getAuthToken()) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      });
    }

    try {
      await ensureCurrentUser(context.queryClient);
    } catch {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      });
    }
  },
  component: RouteComponent,
});
