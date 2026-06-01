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

