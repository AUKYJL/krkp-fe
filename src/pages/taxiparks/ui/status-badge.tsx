import { cn } from "@/shared/utils";

interface StatusBadgeProps {
  label: string;
  tone?: "default" | "accent" | "muted";
}

export const StatusBadge = ({
  label,
  tone = "default",
}: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-[10px] px-3 text-xs font-semibold",
        tone === "default" && "bg-accent-primary-soft text-text-primary",
        tone === "accent" && "bg-dark-primary-soft text-text-primary",
        tone === "muted" &&
          "border border-border-default bg-background-page text-text-secondary",
      )}
    >
      {label}
    </span>
  );
};
