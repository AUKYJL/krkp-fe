import { createFileRoute } from "@tanstack/react-router";

import { DriverDetailPage } from "@/pages/drivers";

const RouteComponent = () => {
  const { id } = Route.useParams();

  return <DriverDetailPage driverId={id} />;
};

export const Route = createFileRoute("/drivers/$id")({
  component: RouteComponent,
});

