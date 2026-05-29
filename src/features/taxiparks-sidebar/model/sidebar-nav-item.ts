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
  iconGlyph: string;
  to: string;
  isMuted?: boolean;
}

