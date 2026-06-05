import { Outlet, createFileRoute } from "@tanstack/react-router";

const RouteComponent = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/_app/vehicles/$id")({
  component: RouteComponent,
});
