import { Outlet, createFileRoute } from "@tanstack/react-router";

const RouteComponent = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/vehicles")({
  component: RouteComponent,
});
