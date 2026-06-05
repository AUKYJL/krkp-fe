import { createFileRoute } from "@tanstack/react-router";

import { ReportsPage } from "@/pages/reports";

const RouteComponent = () => {
  return <ReportsPage />;
};

export const Route = createFileRoute("/_app/reports")({
  component: RouteComponent,
});
