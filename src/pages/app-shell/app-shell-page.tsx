import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { TaxiparksSidebar } from "@/features/taxiparks-sidebar";

export const AppShellPage = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="relative h-dvh w-full">
      <TaxiparksSidebar />
      <div
        ref={scrollContainerRef}
        className="ml-[280px] h-dvh min-w-0 overflow-y-auto"
      >
        <Outlet />
      </div>
    </div>
  );
};
