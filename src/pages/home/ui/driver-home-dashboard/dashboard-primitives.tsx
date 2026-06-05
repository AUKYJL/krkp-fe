import { AppText } from "@/shared/ui/app-text";
import { cn } from "@/shared/utils";

type DashboardPillProps = {
  label: string;
  tone?: "default" | "accent" | "muted";
};

type SummaryRowProps = {
  label: string;
  value: string;
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
