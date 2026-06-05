import { createFileRoute } from "@tanstack/react-router";

import { DriversPage } from "@/pages/drivers";

const RouteComponent = () => {
  return <DriversPage />;
};

export const Route = createFileRoute("/_app/drivers/")({
  component: RouteComponent,
});
