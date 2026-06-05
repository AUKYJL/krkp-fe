import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { DriverDetailPage } from "@/pages/drivers";

const driverDetailSearchSchema = z.object({
  mode: z.enum(["internal", "external"]).optional(),
});

const RouteComponent = () => {
  const { id } = Route.useParams();
  const { mode } = Route.useSearch();

  return <DriverDetailPage driverId={id} mode={mode ?? "internal"} />;
};

export const Route = createFileRoute("/drivers/$id/")({
  validateSearch: (search) => driverDetailSearchSchema.parse(search),
  component: RouteComponent,
});
