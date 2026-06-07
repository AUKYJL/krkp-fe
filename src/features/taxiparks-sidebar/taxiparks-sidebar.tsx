import { useRouterState } from "@tanstack/react-router";

import { useCurrentUserQuery } from "@/shared/api/auth";
import {
  AppText,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS_VARIABLES,
} from "@/shared/ui/app-text";

import { getTaxiparksSidebarNav } from "./model/sidebar-nav";
import { TaxiparksSidebarNavItem } from "./ui/taxiparks-sidebar-nav-item";

function getActiveNavId(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname === "/taxiparks") return "taxiparks";
  if (pathname.startsWith("/taxiparks/")) return "taxiparks";

  if (pathname === "/drivers" || pathname.startsWith("/drivers/"))
    return "drivers";
  if (pathname === "/vehicles" || pathname.startsWith("/vehicles/"))
    return "vehicles";
  if (pathname === "/finance" || pathname.startsWith("/finance/"))
    return "finance";
  if (pathname === "/reports" || pathname.startsWith("/reports/"))
    return "reports";
  if (pathname === "/settings" || pathname.startsWith("/settings/"))
    return "settings";

  return null;
}

export const TaxiparksSidebar = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: currentUser } = useCurrentUserQuery();
  const activeId = getActiveNavId(pathname);
  const navItems = getTaxiparksSidebarNav(currentUser?.role);

  return (
    <aside className="bg-background-sidebar fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col overflow-hidden px-4 py-6">
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="flex items-center gap-3 px-2 pb-2">
          <div className="bg-accent-primary flex h-9 w-9 items-center justify-center rounded-[10px]">
            <AppText
              variant={TEXT_VARIANTS_VARIABLES.inverse}
              size={TEXT_SIZES_VARIABLES.small}
              className="text-[15px] leading-none font-bold"
            >
              TF
            </AppText>
          </div>

          <div className="flex flex-col gap-0.5">
            <AppText
              variant={TEXT_VARIANTS_VARIABLES.inverse}
              size={TEXT_SIZES_VARIABLES.medium}
              className="font-bold"
            >
              TaxiFleet Pro
            </AppText>
            <AppText
              variant={TEXT_VARIANTS_VARIABLES.inverseMuted}
              size={TEXT_SIZES_VARIABLES.xs}
              className="font-medium"
            >
              B2B Control Panel
            </AppText>
          </div>
        </div>

        <div className="bg-inverse-divider h-px w-full" />

        <nav className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <TaxiparksSidebarNavItem
                key={item.id}
                item={item}
                isActive={activeId === item.id}
              />
            ))}
          </div>
        </nav>

        <div className="mt-auto" />
      </div>
    </aside>
  );
};
