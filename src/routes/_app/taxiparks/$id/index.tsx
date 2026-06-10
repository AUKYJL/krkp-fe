import { createFileRoute } from "@tanstack/react-router";

import { TaxiparkDetailPage } from "@/pages/taxiparks";

const RouteComponent = () => {
  const { id } = Route.useParams();

  return <TaxiparkDetailPage taxiparkId={id} />;
};

export const Route = createFileRoute("/_app/taxiparks/$id/")({
  component: RouteComponent,
});
