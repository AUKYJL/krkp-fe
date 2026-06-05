export type VehicleStatus = "ok" | "risk" | "unassigned";

export interface VehicleRow {
  plate: string;
  brand: string;
  driver: string;
  park: string;
  status: VehicleStatus;
  revenue: number;
  averageDayRevenue: number;
  workdays: number;
  downtimeDays: number;
  downtimePercent: number;
  efficiencyIndex: number;
}

export interface VehicleTopItem {
  place: number;
  title: string;
  secondaryText: string;
  value: number;
}

export interface VehicleDetailSummaryCard {
  label: string;
  value: string;
  meta: string;
}

export interface VehicleDetailKpi {
  label: string;
  value: string;
  meta: string;
}

export interface VehicleDetailRevenuePoint {
  date: string;
  value: number;
}

export interface VehicleDetailDowntime {
  statusLabel: string;
  statusTone: "default" | "accent";
  lostProfit: number;
  daysDown: number;
  averageIdleStreak: number;
  revenueImpactPercent: number;
  previousRevenueImpactPercent: number;
  note: string;
}

export interface VehicleDetailRecord {
  plate: string;
  title: string;
  description: string;
  updatedAt: string;
  photoLabel: string;
  efficiencyIndex: number;
  efficiencyCaption: string;
  summaryCards: VehicleDetailSummaryCard[];
  kpis: VehicleDetailKpi[];
  revenueSeries: VehicleDetailRevenuePoint[];
  downtime: VehicleDetailDowntime;
}
