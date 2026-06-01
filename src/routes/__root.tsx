import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { TaxiparksSidebar } from "@/features/taxiparks-sidebar";

const RootComponent = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="relative h-dvh w-full">
      <TaxiparksSidebar />
      <div
        className="ml-[280px] h-dvh min-w-0 overflow-y-auto"
        ref={scrollContainerRef}
      >
        <Outlet />
      </div>
    </div>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
