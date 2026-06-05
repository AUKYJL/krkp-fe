import { createFileRoute } from "@tanstack/react-router";

import { RegisterPage } from "@/pages/auth";

const RouteComponent = () => {
  return <RegisterPage />;
};

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
});
