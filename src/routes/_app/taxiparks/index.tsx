import { createFileRoute } from "@tanstack/react-router";

import { TaxiParksPage } from "@/pages/taxiparks";

const RouteComponent = () => {
  return <TaxiParksPage />;
};

export const Route = createFileRoute("/_app/taxiparks/")({
  component: RouteComponent,
});
