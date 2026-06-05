import { AppText } from "@/shared/ui/app-text";
import { cn } from "@/shared/utils";

type DetailRowProps = {
  label: string;
  value: string;
  multiline?: boolean;
};

export const DetailRow = ({
  label,
  value,
  multiline = false,
}: DetailRowProps) => {
  return (
    <div className="bg-background-page flex flex-col gap-1 rounded-[16px] px-4 py-3">
      <AppText className="text-text-secondary text-xs font-semibold tracking-[0.08em] uppercase">
        {label}
      </AppText>
      <AppText
        className={cn(
          "text-text-primary text-sm font-semibold",
          multiline && "leading-6",
        )}
      >
        {value}
      </AppText>
    </div>
  );
};
