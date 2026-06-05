import { AppText } from "@/shared/ui/app-text";
import { CardSurface } from "@/shared/ui/card-surface";
import { cn } from "@/shared/utils";

import type { DriverRow } from "../consts";

interface DriverCardProps {
  driver: DriverRow;
  onClick?: () => void;
}

const getDriverInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export const DriverCard = ({ driver, onClick }: DriverCardProps) => {
  return (
    <CardSurface
      className={cn(
        "border-dark-primary/10 flex-row gap-4 rounded-[18px] border p-2 transition-colors",
        onClick
          ? "hover:border-dark-primary/20 cursor-pointer focus-visible:border-dark-primary/20 focus-visible:ring-dark-primary/10 focus-visible:ring-4"
          : undefined,
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="bg-dark-primary-soft text-text-primary flex size-14 items-center justify-center rounded-full text-base font-bold">
        {getDriverInitials(driver.driver)}
      </div>

      <div className="flex flex-col gap-1">
        <AppText className="text-text-primary text-base font-semibold">
          {driver.driver}
        </AppText>
        <AppText className="text-text-primary/60 text-sm font-medium">
          Стаж: {driver.experience}
        </AppText>
      </div>
    </CardSurface>
  );
};
