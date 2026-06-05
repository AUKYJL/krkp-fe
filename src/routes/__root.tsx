import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

const RootComponent = () => {
  return <Outlet />;
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
});
