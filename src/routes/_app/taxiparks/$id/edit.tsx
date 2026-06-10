import { createFileRoute } from "@tanstack/react-router";

import { TaxiparkEditPage } from "@/pages/taxiparks";

const RouteComponent = () => {
  const { id } = Route.useParams();

  return <TaxiparkEditPage taxiparkId={id} />;
};

export const Route = createFileRoute("/_app/taxiparks/$id/edit")({
  component: RouteComponent,
});
