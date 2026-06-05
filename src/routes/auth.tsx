import { createFileRoute } from "@tanstack/react-router";

import { AuthLayoutPage } from "@/pages/auth";

const RouteComponent = () => {
  return <AuthLayoutPage />;
};

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});
