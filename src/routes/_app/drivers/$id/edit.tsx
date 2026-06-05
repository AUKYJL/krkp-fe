import { createFileRoute } from "@tanstack/react-router";

import { DriverEditPage } from "@/pages/drivers";

const RouteComponent = () => {
  const { id } = Route.useParams();

  return <DriverEditPage driverId={id} />;
};

export const Route = createFileRoute("/_app/drivers/$id/edit")({
  component: RouteComponent,
});
