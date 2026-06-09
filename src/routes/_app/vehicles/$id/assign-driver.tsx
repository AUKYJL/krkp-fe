import { createFileRoute } from "@tanstack/react-router";

import { VehicleAssignDriverPage } from "@/pages/vehicles";

const RouteComponent = () => {
  const { id } = Route.useParams();

  return <VehicleAssignDriverPage carId={id} />;
};

export const Route = createFileRoute("/_app/vehicles/$id/assign-driver")({
  component: RouteComponent,
});
