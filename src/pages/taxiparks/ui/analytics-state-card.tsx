import { AlertCircle } from "lucide-react";

import { AppText } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { Spinner } from "@/shared/ui/spinner";

type AnalyticsStateCardProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "loading" | "error" | "empty";
};

export const AnalyticsStateCard = ({
  title,
  message,
  actionLabel,
  onAction,
  tone = "empty",
}: AnalyticsStateCardProps) => {
  return (
    <CardSurface className="items-center justify-center gap-4 rounded-[20px] px-6 py-10 text-center">
      {tone === "loading" ? (
        <Spinner className="size-8 min-h-0" />
      ) : tone === "error" ? (
        <div className="bg-accent-primary-soft text-accent-primary flex size-12 items-center justify-center rounded-full">
          <AlertCircle className="size-6" />
        </div>
      ) : null}

      <div className="flex max-w-[520px] flex-col gap-2">
        <AppText className="text-text-primary text-base font-bold">
          {title}
        </AppText>
        <AppText className="text-text-secondary text-sm font-medium">
          {message}
        </AppText>
      </div>

      {actionLabel && onAction ? (
        <Button
          type="button"
          variant={BUTTON_VARIANTS_VARIABLES.secondary}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </CardSurface>
  );
};
