import { Building2, Mail } from "lucide-react";

import type { DriverSearchItem } from "@/pages/drivers/model";
import { AppText } from "@/shared/ui/app-text";
import { Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { cn } from "@/shared/utils";

interface DriverCardProps {
  driver: DriverSearchItem;
  onClick?: () => void;
  onInvite?: () => void;
  inviteDisabled?: boolean;
  invitePending?: boolean;
  feedback?: {
    message: string;
    tone: "success" | "error";
  };
}

const getDriverInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const getMembershipBadge = (isInTaxiPark: boolean) => {
  if (isInTaxiPark) {
    return {
      label: "В таксопарке",
      className: "bg-accent-primary-soft text-accent-primary",
      description: "Уже состоит в таксопарке",
    };
  }

  return {
    label: "Свободен",
    className: "bg-dark-primary-soft text-text-primary",
    description: "Не привязан к таксопарку",
  };
};

export const DriverCard = ({
  driver,
  onClick,
  onInvite,
  inviteDisabled,
  invitePending,
  feedback,
}: DriverCardProps) => {
  const membershipBadge = getMembershipBadge(driver.isInTaxiPark);

  return (
    <CardSurface className="border-dark-primary/10 gap-4 rounded-[18px] border p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div
          className={cn(
            "flex min-w-0 flex-1 gap-4 rounded-[16px] transition-colors",
            onClick
              ? "hover:bg-background-page/70 cursor-pointer focus-visible:ring-dark-primary/10 focus-visible:border-dark-primary/20 focus-visible:ring-4"
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
          <div className="bg-dark-primary-soft text-text-primary flex size-14 shrink-0 items-center justify-center rounded-full text-base font-bold">
            {getDriverInitials(driver.fullName)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <AppText className="text-text-primary truncate text-base font-semibold">
                {driver.fullName}
              </AppText>
              <span
                className={cn(
                  "inline-flex h-7 items-center rounded-[10px] px-3 text-xs font-semibold",
                  membershipBadge.className,
                )}
              >
                {membershipBadge.label}
              </span>
            </div>

            <div className="mt-2 flex flex-col gap-2 text-sm">
              <div className="text-text-secondary flex items-center gap-2 font-medium">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{driver.email}</span>
              </div>
              <div className="text-text-secondary flex items-center gap-2 font-medium">
                <Building2 className="size-4 shrink-0" />
                <span>{membershipBadge.description}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col items-stretch gap-2 lg:w-auto lg:min-w-[180px]">
          <Button
            type="button"
            className="w-full"
            disabled={inviteDisabled}
            onClick={(event) => {
              event.stopPropagation();
              onInvite?.();
            }}
          >
            {invitePending ? "Отправляем..." : "Пригласить"}
          </Button>
          {feedback ? (
            <AppText
              className={cn(
                "text-sm font-medium",
                feedback.tone === "success"
                  ? "text-status-success"
                  : "text-status-error",
              )}
            >
              {feedback.message}
            </AppText>
          ) : null}
        </div>
      </div>
    </CardSurface>
  );
};
