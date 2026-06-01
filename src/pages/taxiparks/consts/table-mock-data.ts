import type { TaxiParkRow } from "./types";

export const tableMockData: TaxiParkRow[] = Array.from({ length: 42 }).map(
  (_, index) => {
    const id = String(index + 1).padStart(4, "0");
    const cars = 30 + ((index * 7) % 80);
    const drivers = Math.max(10, Math.round(cars * (0.7 + (index % 5) * 0.08)));
    const revenue = 400_000 + index * 28_500;
    const revenuePerDriver = Math.round(revenue / Math.max(1, drivers));
    const activeCars = Math.round(cars * (0.55 + (index % 6) * 0.06));
    const downtimePercent = Number(((index * 3.7) % 28).toFixed(1));
    const ratingPlace = 1 + (index % 12);

    return {
      id,
      name: `Таксопарк ${id}`,
      cars,
      drivers,
      revenue,
      revenuePerDriver,
      activeCars,
      downtimePercent,
      ratingPlace,
      status: index % 5 === 0 ? "risk" : "ok",
    };
  },
);

