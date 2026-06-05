import type { VehicleStatus } from "./types";

export const VEHICLE_STATUS_VALUES = ["ok", "risk", "unassigned"] as const;

export const VEHICLE_STATUS_OPTIONS: Array<{
  value: VehicleStatus;
  label: string;
}> = [
  { value: "ok", label: "Исправен" },
  { value: "risk", label: "Аварийный" },
  { value: "unassigned", label: "Не назначен" },
];

export const getVehicleStatusConfig = (status: VehicleStatus) => {
  if (status === "ok") {
    return {
      label: "Исправен",
      className: "bg-accent-primary-soft text-text-primary",
    };
  }

  if (status === "risk") {
    return {
      label: "Аварийный",
      className: "bg-dark-primary-soft text-text-primary",
    };
  }

  return {
    label: "Не назначен",
    className:
      "border border-border-default bg-background-page text-text-secondary",
    tone: "accent" as const,
  };
};
