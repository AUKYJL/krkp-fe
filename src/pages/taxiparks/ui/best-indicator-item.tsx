import { AppText } from "@/shared/ui/app-text";

interface BestIndicatorItemProps {
  title: string;
  subtitle: string;
  value: string;
}

export const BestIndicatorItem = ({
  title,
  subtitle,
  value,
}: BestIndicatorItemProps) => {
  return (
    <div className="bg-background-page flex items-center gap-4 rounded-[10px] p-4">
      <div className="bg-accent-primary h-10 w-1 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <AppText className="text-text-primary text-xs font-medium">
          {subtitle}
        </AppText>
        <AppText className="text-text-primary truncate text-sm font-semibold">
          {title}
        </AppText>
      </div>
      <AppText className="text-accent-primary text-xl font-bold">
        {value}
      </AppText>
    </div>
  );
};
