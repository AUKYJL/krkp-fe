import { createFileRoute } from "@tanstack/react-router";

import { VehicleDetailPage } from "@/pages/vehicles";

const RouteComponent = () => {
  const { id } = Route.useParams();

  return <VehicleDetailPage carId={id} />;
};

export const Route = createFileRoute("/_app/vehicles/$id/")({
  component: RouteComponent,
});
