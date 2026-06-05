import { createFileRoute } from "@tanstack/react-router";

import { VehicleEditPage } from "@/pages/vehicles";

const RouteComponent = () => {
  const { id } = Route.useParams();

  return <VehicleEditPage vehiclePlate={id} />;
};

export const Route = createFileRoute("/vehicles/$id/edit")({
  component: RouteComponent,
});
