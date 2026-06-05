import { createFileRoute } from "@tanstack/react-router";

import { VehicleDetailPage } from "@/pages/vehicles";

const RouteComponent = () => {
  const { id } = Route.useParams();

  return <VehicleDetailPage vehiclePlate={id} />;
};

export const Route = createFileRoute("/vehicles/$id")({
  component: RouteComponent,
});
