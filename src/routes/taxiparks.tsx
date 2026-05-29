import { createFileRoute } from "@tanstack/react-router";

import { TaxiParksPage } from "@/pages/taxiparks";

export const Route = createFileRoute("/taxiparks")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TaxiParksPage />;
}
