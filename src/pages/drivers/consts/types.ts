export type DriverStatus = "active" | "risk";

export type DriverRow = {
  id: string;
  driver: string;
  experience: string;
  car: string;
  revenue: number;
  avgPerDay: number;
  workdays: number;
  zeroDays: number;
  exitPercent: number;
  rank: number;
  status: DriverStatus;
};
