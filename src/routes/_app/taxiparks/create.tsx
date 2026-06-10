import { createFileRoute } from "@tanstack/react-router";

import { TaxiparkCreatePage } from "@/pages/taxiparks";

const RouteComponent = () => {
  return <TaxiparkCreatePage />;
};

export const Route = createFileRoute("/_app/taxiparks/create")({
  component: RouteComponent,
});
