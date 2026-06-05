import { driverMockData } from "@/pages/drivers/consts";

import type { CurrentUser } from "@/shared/api/auth";

export type DriverVehicleStatus =
  | "ok"
  | "attention"
  | "unavailable"
  | "maintenance";

export type DriverVehiclePageData = {
  driverName: string;
  isOnLine: boolean;
  canCompleteShift: boolean;
  vehicle: {
    brand: string;
    model: string;
    plate: string;
    status: DriverVehicleStatus;
    mileageKm: number;
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    canGoOnLine: boolean;
    activeProblems: string[];
    restrictionReason?: string;
  } | null;
};

const formatPlateNumber = (plate: string) => {
  if (plate.length < 6) {
    return plate;
  }

  const normalized = plate.replaceAll(" ", "");

  return `${normalized.slice(0, 1)}${normalized.slice(1, 4)}${normalized.slice(4, 6)} ${normalized.slice(6)}`.trim();
};

const buildVehicleMeta = (driverName: string) => {
  const byName = driverMockData.find((item) => item.driver === driverName);

  if (!byName) {
    return null;
  }

  const isRisk = byName.status === "risk";
  const isOnLine = byName.status === "active";
  const status: DriverVehicleStatus = isRisk ? "attention" : "ok";
  const activeProblems = isRisk
    ? ["Низкое давление в шинах", "Требуется замена масла"]
    : [];

  return {
    driverName: byName.driver,
    isOnLine,
    canCompleteShift: isOnLine,
    vehicle: {
      brand: "Kia",
      model: "Rio",
      plate: formatPlateNumber(byName.car),
      status,
      mileageKm: 145_000 - byName.rank * 1_250,
      lastMaintenanceDate: "01.05.2026",
      nextMaintenanceDate: "01.06.2026",
      canGoOnLine: !isRisk,
      activeProblems,
      restrictionReason: isRisk
        ? "Нельзя выйти на линию: автомобиль требует диагностики перед сменой."
        : undefined,
    },
  };
};

export const buildDriverVehiclePageData = (
  currentUser: CurrentUser,
): DriverVehiclePageData => {
  const vehicleMeta = buildVehicleMeta(currentUser.fullName);

  if (!vehicleMeta) {
    return {
      driverName: currentUser.fullName,
      isOnLine: false,
      canCompleteShift: false,
      vehicle: {
        brand: "BMW",
        model: "X5",
        plate: "ВО887Р",
        status: "ok",
        mileageKm: 0,
        lastMaintenanceDate: "",
        nextMaintenanceDate: "",
        canGoOnLine: false,
        activeProblems: [],
        restrictionReason: undefined,
      },
    };
  }

  return vehicleMeta;
};

export const getDriverVehicleStatusConfig = (status: DriverVehicleStatus) => {
  if (status === "ok") {
    return {
      label: "Исправен",
      tone: "default" as const,
    };
  }

  if (status === "attention") {
    return {
      label: "Требует внимания",
      tone: "accent" as const,
    };
  }

  if (status === "maintenance") {
    return {
      label: "На обслуживании",
      tone: "accent" as const,
    };
  }

  return {
    label: "Недоступен",
    tone: "muted" as const,
  };
};

export const formatVehicleMileage = (value: number) => {
  return `${new Intl.NumberFormat("ru-RU").format(value)} км`;
};
