import { createFileRoute } from "@tanstack/react-router";

import { DriversPage } from "@/pages/drivers";

export const Route = createFileRoute("/drivers")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DriversPage />;
}
