import {
  AppText,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS_VARIABLES,
} from "@/shared/ui/app-text";

import {
  homeKpiCards,
  homeRevenueByDayData,
  homeTotalLossesKpiCard,
} from "./consts/home-mock-data";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { ProgressCard } from "@/features/progress-card";
import { TitledBlock } from "@/features/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";

export const HomePage = () => {
  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader title="Главная" description="Сводка ключевых показателей" />

      <section className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {homeKpiCards.map((card) => (
            <KpiCard key={String(card.label)} {...card} />
          ))}
        </div>

        <KpiCard {...homeTotalLossesKpiCard} />
      </section>

      <section className="flex min-w-0 flex-col gap-4">
        <TitledBlock
          title="Выручка"
          subtitle="Динамика по дням"
          className="min-w-0"
        >
          <VerticalBarChart
            data={homeRevenueByDayData}
            valueLabel="Выручка, ₽"
            height={240}
            yTickFormatter={(value) => Intl.NumberFormat("ru-RU").format(value)}
          />
        </TitledBlock>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <TitledBlock
            title="Топ-3 водителей по выручке"
            className="min-w-0"
            contentClassName="mt-2"
          >
            <div className="flex flex-col gap-2">
              {[
                {
                  place: 1,
                  name: "Иван Петров",
                  revenue: "₽ 412 000",
                  progress: 100,
                },
                {
                  place: 2,
                  name: "Алексей Смирнов",
                  revenue: "₽ 387 000",
                  progress: 94,
                },
                {
                  place: 3,
                  name: "Руслан Ахмедов",
                  revenue: "₽ 361 000",
                  progress: 88,
                },
              ].map((row) => (
                <ProgressCard
                  key={row.place}
                  title={`${row.place}. ${row.name}`}
                  secondaryText={row.revenue}
                  value={row.progress}
                />
              ))}
            </div>
          </TitledBlock>

          <TitledBlock
            title="Топ-3 автомобилей по эффективности"
            className="min-w-0"
            contentClassName="mt-2"
          >
            <div className="flex flex-col gap-3">
              {[
                { place: 1, plate: "А123ВС 77", value: 98 },
                { place: 2, plate: "М542КР 97", value: 95 },
                { place: 3, plate: "Т908ОР 50", value: 92 },
              ].map((row) => (
                <ProgressCard
                  key={row.plate}
                  title={`${row.place}. ${row.plate}`}
                  secondaryText={`${row.value}%`}
                  value={row.value}
                />
              ))}
            </div>
          </TitledBlock>

          <TitledBlock
            title="Критические уведомления"
            className="min-w-0"
            contentClassName="mt-2"
          >
            <div className="flex flex-col gap-2">
              {[
                "Критическая просадка выручки в таксопарке Север-1: -17% за 2 дня",
                "Рост простоев автомобилей до 14% в таксопарке Центр",
                "Снижение процента выхода на линию до 81% (ниже целевого 87%)",
              ].map((text) => (
                <div
                  key={text}
                  className="bg-background-page flex min-h-11 items-center gap-2 rounded-[10px] px-[10px] py-2"
                >
                  <div className="bg-accent-primary w-2 self-stretch rounded-full" />
                  <AppText
                    variant={TEXT_VARIANTS_VARIABLES.main}
                    size={TEXT_SIZES_VARIABLES.xss}
                    className="leading-snug font-medium"
                  >
                    {text}
                  </AppText>
                </div>
              ))}
            </div>
          </TitledBlock>
        </div>
      </section>
    </main>
  );
};
