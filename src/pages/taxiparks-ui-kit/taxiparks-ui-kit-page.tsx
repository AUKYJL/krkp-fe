import type { ColumnDef } from "@tanstack/react-table";

import {
  AppText,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS_VARIABLES,
} from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";

import { CsvExportButton } from "@/features/csv-export-button";
import { DataTable } from "@/features/data-table";
import { DonutPieChart } from "@/features/donut-pie-chart";
import { KpiCard } from "@/features/kpi-card";
import { ProgressCard } from "@/features/progress-card";
import { TitledBlock } from "@/features/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";

type TaxiParkRow = {
  id: string;
  name: string;
  city: string;
  cars: number;
  revenue: number;
  status: "active" | "paused";
};

const donutPieChartMockData = [
  { label: "Южный парк", value: 123 },
  { label: "Северный парк", value: 46 },
  { label: "Город Такси", value: 25 },
  { label: "Остальные", value: 29 },
];

const verticalBarChartMockData = [
  { date: "01.05", value: 18500 },
  { date: "02.05", value: 27700 },
  { date: "03.05", value: 22400 },
  { date: "04.05", value: 31200 },
  { date: "05.05", value: 28900 },
  { date: "06.05", value: 14200 },
  { date: "07.05", value: 9800 },
  { date: "08.05", value: 24800 },
  { date: "09.05", value: 29600 },
  { date: "10.05", value: 27100 },
  { date: "11.05", value: 33800 },
  { date: "12.05", value: 20100 },
  { date: "13.05", value: 12600 },
  { date: "14.05", value: 30400 },
  { date: "15.05", value: 36500 },
  { date: "16.05", value: 34400 },
  { date: "17.05", value: 15900 },
  { date: "18.05", value: 23100 },
  { date: "19.05", value: 28200 },
  { date: "20.05", value: 40100 },
  { date: "21.05", value: 37800 },
  { date: "22.05", value: 25200 },
  { date: "23.05", value: 17800 },
  { date: "24.05", value: 29800 },
  { date: "25.05", value: 35200 },
  { date: "26.05", value: 32900 },
  { date: "27.05", value: 28500 },
  { date: "28.05", value: 48900 },
  { date: "29.05", value: 31200 },
  { date: "30.05", value: 41300 },
];

const tableMockData: TaxiParkRow[] = Array.from({ length: 67 }).map(
  (_, index) => {
    const id = String(index + 1).padStart(4, "0");
    return {
      id,
      name: `Таксопарк ${id}`,
      city: index % 3 === 0 ? "Москва" : index % 3 === 1 ? "Казань" : "Сочи",
      cars: 18 + ((index * 7) % 42),
      revenue: 250_000 + index * 19_500,
      status: index % 5 === 0 ? "paused" : "active",
    };
  },
);

const columns: ColumnDef<TaxiParkRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "cars",
    header: "Cars",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        {Intl.NumberFormat("ru-RU").format(getValue<number>())} ₽
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const value = getValue<TaxiParkRow["status"]>();
      return (
        <span className="bg-accent-primary-soft text-text-primary inline-flex h-7 items-center rounded-[10px] px-3 text-xs font-semibold">
          {value === "active" ? "Активен" : "Пауза"}
        </span>
      );
    },
  },
];

export const TaxiparksUiKitPage = () => {
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
          <Button>Primary</Button>
          <Button variant={BUTTON_VARIANTS_VARIABLES.secondary}>
            Secondary
          </Button>
          <Button variant={BUTTON_VARIANTS_VARIABLES.tertiary}>Tertiary</Button>
        </div>
      </section>

      <section className="bg-background-card flex flex-col gap-3 rounded-[14px] p-4">
        <AppText
          variant={TEXT_VARIANTS_VARIABLES.main}
          size={TEXT_SIZES_VARIABLES.medium}
          className="font-bold"
        >
          Charts
        </AppText>

        <div className="flex flex-col gap-6">
          <DonutPieChart
            data={donutPieChartMockData}
            centerLabel="2.8M"
            centerSubLabel="руб."
          />

          <VerticalBarChart
            data={verticalBarChartMockData}
            valueLabel="Выручка, ₽"
            height={180}
            yTickFormatter={(value) => Intl.NumberFormat("ru-RU").format(value)}
            tooltipValueFormatter={(value) => (
              <>
                ₽ {Intl.NumberFormat("ru-RU").format(value)}
              </>
            )}
          />
        </div>
      </section>

      <ProgressCard
        title="Progress card"
        value={42}
        secondaryText="42 из 100"
      />

      <KpiCard
        label="Общее количество таксопарков"
        value="24"
        meta="+3 за месяц"
        valueClassName="text-text-primary"
        metaClassName="text-accent-primary"
      />

      <TitledBlock
        title="Block / Slots"
        subtitle="title + subtitle + topRightSlot + children"
        topRightSlot={
          <div className="bg-accent-primary-soft text-text-primary inline-flex h-7 items-center rounded-[10px] px-3 text-xs font-semibold">
            Исправен
          </div>
        }
      >
        <DonutPieChart
          data={donutPieChartMockData}
          centerLabel="2.8M"
          centerSubLabel="руб."
        />
      </TitledBlock>

      <TitledBlock
        title="Table"
        subtitle="TanStack Table + sorting + pagination"
        topRightSlot={
          <CsvExportButton
            columns={columns}
            data={tableMockData}
            fileName="taxiparks"
          />
        }
      >
        <DataTable
          columns={columns}
          data={tableMockData}
          onRowClick={(row) => {
            console.log("row click", row);
          }}
        />
      </TitledBlock>
    </main>
  );
};
