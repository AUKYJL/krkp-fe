import { createFileRoute } from "@tanstack/react-router";

import { DriverAddPage } from "@/pages/drivers/add";

const RouteComponent = () => {
  return <DriverAddPage />;
};

export const Route = createFileRoute("/_app/drivers/add")({
  component: RouteComponent,
});
