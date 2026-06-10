import { Banknote, Building2, CarFront, House, UserRound } from "lucide-react";

import { ROLES } from "@/shared/types";

import type { TaxiparksSidebarNavItem } from "./sidebar-nav-item";

export const TAXIPARKS_SIDEBAR_NAV: TaxiparksSidebarNavItem[] = [
  { id: "home", label: "Главная", icon: House, to: "/" },
  { id: "taxiparks", label: "Таксопарки", icon: Building2, to: "/taxiparks" },
  { id: "drivers", label: "Водители", icon: UserRound, to: "/drivers" },
  { id: "vehicles", label: "Автомобили", icon: CarFront, to: "/vehicles" },
  { id: "finance", label: "Финансы", icon: Banknote, to: "/finance" },
];

export const TAXIPARKS_SIDEBAR_NAV_BY_ID = Object.fromEntries(
  TAXIPARKS_SIDEBAR_NAV.map((item) => [item.id, item]),
) as Record<TaxiparksSidebarNavItem["id"], TaxiparksSidebarNavItem>;

export const getTaxiparksSidebarNav = (role?: string) => {
  if (role === ROLES.DRIVER) {
    return TAXIPARKS_SIDEBAR_NAV.filter((item) => item.id !== "drivers");
  } else if (role === ROLES.DIRECTOR) {
    return TAXIPARKS_SIDEBAR_NAV.filter((item) => item.id !== "finance");
  }

  return TAXIPARKS_SIDEBAR_NAV;
};
