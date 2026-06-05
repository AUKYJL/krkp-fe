import { createFileRoute } from "@tanstack/react-router";

import { DriverAddPage } from "@/pages/drivers";

const RouteComponent = () => {
  return <DriverAddPage />;
};

export const Route = createFileRoute("/drivers/add")({
  component: RouteComponent,
});
