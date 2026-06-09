export type WorkDayStatus = "ACTIVE" | "COMPLETED" | "DOWNTIME";

export type WorkDayStatusConfig = {
  label: string;
  tone: "default" | "accent" | "muted";
  isOnline: boolean;
  canEditRevenue: boolean;
  canFinishShift: boolean;
};

export const getWorkDayStatusConfig = (
  status?: WorkDayStatus | null,
): WorkDayStatusConfig => {
  if (status === "ACTIVE") {
    return {
      label: "На линии",
      tone: "default",
      isOnline: true,
      canEditRevenue: true,
      canFinishShift: true,
    };
  }

  if (status === "COMPLETED") {
    return {
      label: "Смена завершена",
      tone: "muted",
      isOnline: false,
      canEditRevenue: false,
      canFinishShift: false,
    };
  }

  return {
    label: "Простой",
    tone: "accent",
    isOnline: false,
    canEditRevenue: false,
    canFinishShift: false,
  };
};
