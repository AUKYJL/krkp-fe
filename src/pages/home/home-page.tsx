import { AppText, TEXT_SIZES_VARIABLES, TEXT_VARIANTS_VARIABLES } from "@/shared/ui/app-text";

export function HomePage() {
  return (
    <main className="flex h-full w-full flex-col gap-4 bg-background-page p-6">
      <AppText
        variant={TEXT_VARIANTS_VARIABLES.main}
        size={TEXT_SIZES_VARIABLES.large}
        className="break-words font-bold"
      >
        Главная
      </AppText>
    </main>
  );
}

