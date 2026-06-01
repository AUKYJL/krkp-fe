import { createFileRoute } from "@tanstack/react-router";

import { TaxiparkDetailPage } from "@/pages/taxiparks/taxipark-detail-page";

const RouteComponent = () => {
  const { id } = Route.useParams();

  return <TaxiparkDetailPage taxiparkId={id} />;
};

export const Route = createFileRoute("/taxiparks/$id")({
  component: RouteComponent,
});
