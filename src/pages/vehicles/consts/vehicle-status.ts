import type { VehicleStatus } from "./types";

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
