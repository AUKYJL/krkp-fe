import { createFileRoute } from "@tanstack/react-router";

import { SettingsPage } from "@/pages/settings";

const RouteComponent = () => {
  return <SettingsPage />;
};

export const Route = createFileRoute("/_app/settings")({
  component: RouteComponent,
});
