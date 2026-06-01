import { Outlet, createRootRoute } from "@tanstack/react-router";

import { TaxiparksSidebar } from "@/features/taxiparks-sidebar";

const RootComponent = () => {
  return (
    <div className="relative h-dvh w-full">
      <TaxiparksSidebar />
      <div className="ml-[280px] h-dvh min-w-0 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
