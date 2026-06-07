import { AppText } from "@/shared/ui/app-text";
import { cn } from "@/shared/utils";
import type { ReactNode } from "react";

type DashboardPillProps = {
  label: string;
  tone?: "default" | "accent" | "muted";
};

type SummaryRowProps = {
  label: string;
  value: ReactNode;
};

export const DashboardPill = ({
  label,
  tone = "default",
}: DashboardPillProps) => {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-[10px] px-3 text-xs font-semibold",
        tone === "default" && "bg-accent-primary-soft text-text-primary",
        tone === "accent" && "bg-dark-primary-soft text-text-primary",
        tone === "muted" &&
          "border-border-default bg-background-page text-text-secondary border",
      )}
    >
      {label}
    </span>
  );
};

export const SummaryRow = ({ label, value }: SummaryRowProps) => {
  return (
    <div className="bg-background-page flex items-center justify-between gap-4 rounded-[12px] px-4 py-3">
      <AppText className="text-text-primary text-sm font-medium">
        {label}
      </AppText>
      <AppText className="text-text-primary text-sm font-semibold tabular-nums">
        {value}
      </AppText>
    </div>
  );
};

type DashboardEmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

export const DashboardEmptyState = ({
  title,
  description,
  className,
}: DashboardEmptyStateProps) => {
  return (
    <div
      className={cn(
        "border-border-default bg-background-page flex min-h-36 flex-col items-center justify-center rounded-[16px] border border-dashed px-4 py-6 text-center",
        className,
      )}
    >
      <AppText className="text-text-primary text-sm font-semibold">
        {title}
      </AppText>
      <AppText className="text-text-secondary mt-1 max-w-[420px] text-sm font-medium">
        {description}
      </AppText>
    </div>
  );
};
