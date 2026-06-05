import { createFileRoute } from "@tanstack/react-router";

import { FinancePage } from "@/pages/finance";

const RouteComponent = () => {
  return <FinancePage />;
};

export const Route = createFileRoute("/_app/finance")({
  component: RouteComponent,
});
