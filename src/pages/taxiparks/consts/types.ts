export type TaxiParkStatus = "risk" | "ok";

export type TaxiParkRow = {
  id: string;
  name: string;
  cars: number;
  drivers: number;
  revenue: number;
  revenuePerDriver: number;
  activeCars: number;
  downtimePercent: number;
  ratingPlace: number;
  status: TaxiParkStatus;
};

export type TaxiParkHealthStatus = "stable" | "attention";

export type DirectorTaxiParkTableRow = {
  taxiParkId: string;
  name: string;
  address: string;
  driversCount: number;
  activeDriversCount: number;
  carsCount: number;
  totalRevenue: number;
  averageRevenuePerDay: number;
  averageRevenuePerActiveDriver: number;
  averageRevenuePerCar: number;
  onlineRate: number;
  downtimeRate: number;
  estimatedDowntimeLoss: number;
  healthStatus: TaxiParkHealthStatus;
};
