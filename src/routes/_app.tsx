import { createFileRoute } from "@tanstack/react-router";

import { AppShellPage } from "@/pages/app-shell";

const RouteComponent = () => {
  return <AppShellPage />;
};

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});
