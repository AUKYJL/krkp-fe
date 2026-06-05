import { createFileRoute } from "@tanstack/react-router";

import { VehicleCreatePage } from "@/pages/vehicles";

const RouteComponent = () => {
  return <VehicleCreatePage />;
};

export const Route = createFileRoute("/vehicles/create")({
  component: RouteComponent,
});
