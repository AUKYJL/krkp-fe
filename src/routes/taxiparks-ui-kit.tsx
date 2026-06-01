import { createFileRoute } from "@tanstack/react-router";

import { TaxiparksUiKitPage } from "@/pages/taxiparks-ui-kit/taxiparks-ui-kit-page";

const RouteComponent = () => {
  return <TaxiparksUiKitPage />;
};

export const Route = createFileRoute("/taxiparks-ui-kit")({
  component: RouteComponent,
});
