import type { LucideIcon } from "lucide-react";

export type TaxiparksSidebarSectionId =
  | "home"
  | "taxiparks"
  | "drivers"
  | "vehicles"
  | "finance"
  | "reports"
  | "settings";

export interface TaxiparksSidebarNavItem {
  id: TaxiparksSidebarSectionId;
  label: string;
  icon: LucideIcon;
  to: string;
  isMuted?: boolean;
}
