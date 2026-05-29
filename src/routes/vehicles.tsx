import { createFileRoute } from "@tanstack/react-router";

import { VehiclesPage } from "@/pages/vehicles";

export const Route = createFileRoute("/vehicles")({
  component: RouteComponent,
});

function RouteComponent() {
  return <VehiclesPage />;
}
