import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "@/pages/auth";

const RouteComponent = () => {
  return <LoginPage />;
};

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
});
