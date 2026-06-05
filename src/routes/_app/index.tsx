import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/pages/home";

const RouteComponent = () => {
  return <HomePage />;
};

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
});
