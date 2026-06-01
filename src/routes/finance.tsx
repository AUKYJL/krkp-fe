import { createFileRoute } from "@tanstack/react-router";

import { FinancePage } from "@/pages/finance";

const RouteComponent = () => {
  return <FinancePage />;
};

export const Route = createFileRoute("/finance")({
  component: RouteComponent,
});
