import { createFileRoute } from "@tanstack/react-router";

import { VehiclesPage } from "@/pages/vehicles";

const RouteComponent = () => {
  return <VehiclesPage />;
};

export const Route = createFileRoute("/vehicles")({
  component: RouteComponent,
});
