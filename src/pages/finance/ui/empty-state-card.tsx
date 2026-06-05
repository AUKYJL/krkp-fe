import { AppText } from "@/shared/ui/app-text";
import { CardSurface } from "@/shared/ui/card-surface";

type EmptyStateCardProps = {
  message: string;
};

export const EmptyStateCard = ({ message }: EmptyStateCardProps) => {
  return (
    <CardSurface className="items-center justify-center rounded-[20px] px-6 py-10 text-center">
      <AppText className="text-text-secondary max-w-[420px] text-sm font-medium">
        {message}
      </AppText>
    </CardSurface>
  );
};
