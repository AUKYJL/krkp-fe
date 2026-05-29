import { createRootRoute, Outlet } from "@tanstack/react-router";

import { TaxiparksSidebar } from "@/features/taxiparks-sidebar";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="theme-taxiparks flex h-dvh w-full">
      <TaxiparksSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
