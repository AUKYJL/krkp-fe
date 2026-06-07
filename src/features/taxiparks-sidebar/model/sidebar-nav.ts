import type { TaxiparksSidebarNavItem } from "./sidebar-nav-item";
import { ROLES } from "@/shared/types";

export const TAXIPARKS_SIDEBAR_NAV: TaxiparksSidebarNavItem[] = [
  { id: "home", label: "Главная", iconGlyph: "⌂", to: "/" },
  { id: "taxiparks", label: "Таксопарки", iconGlyph: "▦", to: "/taxiparks" },
  { id: "drivers", label: "Водители", iconGlyph: "👤", to: "/drivers" },
  { id: "vehicles", label: "Автомобили", iconGlyph: "▣", to: "/vehicles" },
  { id: "finance", label: "Финансы", iconGlyph: "₽", to: "/finance" },
  { id: "reports", label: "Отчеты", iconGlyph: "◫", to: "/reports" },
  {
    id: "settings",
    label: "Настройки",
    iconGlyph: "⚙",
    to: "/settings",
    isMuted: true,
  },
];

export const TAXIPARKS_SIDEBAR_NAV_BY_ID = Object.fromEntries(
  TAXIPARKS_SIDEBAR_NAV.map((item) => [item.id, item]),
) as Record<TaxiparksSidebarNavItem["id"], TaxiparksSidebarNavItem>;

export const getTaxiparksSidebarNav = (role?: string) => {
  if (role === ROLES.DRIVER) {
    return TAXIPARKS_SIDEBAR_NAV.filter((item) => item.id !== "drivers");
  }

  return TAXIPARKS_SIDEBAR_NAV;
};
