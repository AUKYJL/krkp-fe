import {
  AppText,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS_VARIABLES,
} from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";

export function TaxiparksUiKitPage() {
  return (
    <main className="bg-background-page flex h-full w-full flex-col gap-6 p-6">
      <AppText
        variant={TEXT_VARIANTS_VARIABLES.main}
        size={TEXT_SIZES_VARIABLES.large}
        className="font-bold"
      >
        UI Kit (Taxi Parks)
      </AppText>

      <section className="bg-background-card flex flex-col gap-3 rounded-[14px] p-4">
        <AppText
          variant={TEXT_VARIANTS_VARIABLES.main}
          size={TEXT_SIZES_VARIABLES.medium}
          className="font-bold"
        >
          Typography
        </AppText>

        <div className="flex flex-col gap-2">
          <AppText
            variant={TEXT_VARIANTS_VARIABLES.main}
            size={TEXT_SIZES_VARIABLES.large}
            className="font-bold"
          >
            Title 28 / Bold
          </AppText>
          <AppText
            variant={TEXT_VARIANTS_VARIABLES.main}
            size={TEXT_SIZES_VARIABLES.medium}
            className="font-bold"
          >
            Section 18 / Bold
          </AppText>
          <AppText
            variant={TEXT_VARIANTS_VARIABLES.main}
            size={TEXT_SIZES_VARIABLES.small}
            className="font-semibold"
          >
            Body 14 / Semibold
          </AppText>
          <AppText
            variant={TEXT_VARIANTS_VARIABLES.main}
            size={TEXT_SIZES_VARIABLES.xs}
            className="font-medium"
          >
            Caption 12 / Medium
          </AppText>
        </div>
      </section>

      <section className="bg-background-card flex flex-col gap-3 rounded-[14px] p-4">
        <AppText
          variant={TEXT_VARIANTS_VARIABLES.main}
          size={TEXT_SIZES_VARIABLES.medium}
          className="font-bold"
        >
          Buttons
        </AppText>

        <div className="flex flex-wrap items-center gap-3">
          <Button className="rounded-[10px] px-3.5 py-2.5">Primary</Button>
        </div>
      </section>
    </main>
  );
}
