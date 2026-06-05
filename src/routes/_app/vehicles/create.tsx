import { createFileRoute } from "@tanstack/react-router";

import { VehicleCreatePage } from "@/pages/vehicles/create";

const RouteComponent = () => {
  return <VehicleCreatePage />;
};

export const Route = createFileRoute("/_app/vehicles/create")({
  component: RouteComponent,
});
