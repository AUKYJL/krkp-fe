import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { AppText } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/utils";

import { DataTable } from "@/features/data-table";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { ProgressCard } from "@/features/progress-card";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";
import { TitledBlock } from "@/features/titled-block";

import { driverMockData, type DriverRow, type DriverStatus } from "./consts";

type PeriodKey = "today" | "week" | "month" | "custom";

const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "custom", label: "Custom" },
];

const currencyFormatter = new Intl.NumberFormat("ru-RU");
const percentFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const driverColumns: ColumnDef<DriverRow>[] = [
  {
    accessorKey: "driver",
    header: "Водитель",
    cell: ({ row }) => (
      <div className="min-w-0">
        <AppText className="truncate text-sm font-semibold">
          {row.original.driver}
        </AppText>
      </div>
    ),
  },
  {
    accessorKey: "car",
    header: "Авто",
    cell: ({ row }) => (
      <span className="text-text-primary text-sm font-medium tabular-nums">
        {row.original.car}
      </span>
    ),
  },
  {
    accessorKey: "revenue",
    header: "Выручка",
    cell: ({ row }) => (
      <span className="text-accent-primary text-sm font-bold tabular-nums">
        ₽ {currencyFormatter.format(row.original.revenue)}
      </span>
    ),
  },
  {
    accessorKey: "avgPerDay",
    header: "В среднем / день",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        ₽ {currencyFormatter.format(row.original.avgPerDay)}
      </span>
    ),
  },
  {
    accessorKey: "workdays",
    header: "Рабочих дней",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {row.original.workdays}
      </span>
    ),
  },
  {
    accessorKey: "zeroDays",
    header: "0-дней",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {row.original.zeroDays}
      </span>
    ),
  },
  {
    accessorKey: "exitPercent",
    header: "Выход %",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {percentFormatter.format(row.original.exitPercent)}%
      </span>
    ),
  },
  {
    accessorKey: "rank",
    header: "Ранг",
    cell: ({ row }) => (
      <span className="text-accent-primary text-sm font-semibold tabular-nums">
        #{row.original.rank}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => <DriverStatusPill status={row.original.status} />,
  },
];

const DriverStatusPill = ({ status }: { status: DriverStatus }) => {
  const config =
    status === "active"
      ? {
          label: "Активен",
          className: "bg-dark-primary-soft text-text-primary",
        }
      : {
          label: "Риск",
          className: "bg-accent-primary-soft text-accent-primary",
        };

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-[10px] px-3 text-xs font-semibold",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
};

const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[10px] bg-background-page px-4 py-3">
      <AppText className="text-text-primary text-sm font-medium">{label}</AppText>
      <AppText className="text-text-primary text-sm font-semibold tabular-nums">
        {value}
      </AppText>
    </div>
  );
};

const driversRevenueTop = [
  { place: 1, title: "Иван Петров", secondaryText: "₽ 412 000", value: 100 },
  { place: 2, title: "Алексей Смирнов", secondaryText: "₽ 387 000", value: 94 },
  { place: 3, title: "Руслан Ахмедов", secondaryText: "₽ 361 000", value: 88 },
];

const driversEfficiencyTop = [
  { place: 1, title: "А123ВС 77", secondaryText: "98%", value: 98 },
  { place: 2, title: "М542КР 97", secondaryText: "95%", value: 95 },
  { place: 3, title: "Т908ОР 50", secondaryText: "92%", value: 92 },
];

export const DriversPage = () => {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodKey>("week");
  const navigate = useNavigate();

  const query = search.trim().toLowerCase();
  const filteredRows =
    query.length === 0
      ? driverMockData
      : driverMockData.filter((row) => {
          return [
            row.driver,
            row.car,
            row.status === "active" ? "активен" : "риск",
          ].some((value) => value.toLowerCase().includes(query));
        });

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={TAXIPARKS_SIDEBAR_NAV_BY_ID.drivers.label}
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.drivers.label },
        ]}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="relative w-full sm:w-[220px] lg:w-[260px]">
              <Search className="text-text-primary/60 pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Поиск водителя"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PERIODS.map((item) => {
                const isActive = period === item.key;

                return (
                  <Button
                    key={item.key}
                    type="button"
                    variant={
                      isActive
                        ? BUTTON_VARIANTS_VARIABLES.tertiary
                        : BUTTON_VARIANTS_VARIABLES.secondary
                    }
                    className="h-10 rounded-[12px] px-3.5"
                    onClick={() => setPeriod(item.key)}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>

            <Button type="button" className="h-10 rounded-[12px] px-4">
              <Plus className="size-4" />
              Добавить водителя
            </Button>
          </div>
        }
      />

      <section className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            label="Всего водителей"
            value="248"
            meta="в активном составе"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
          <KpiCard
            label="Активных на линии"
            value="213"
            meta="85.9% от базы"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
          <KpiCard
            label="Средняя выручка / день"
            value="₽ 8 420"
            meta="за текущий период"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            label="Процент выхода"
            value="76.4%"
            meta="ниже плана на 3.1 п.п."
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
          <KpiCard
            label="Водителей в риске"
            value="97"
            meta="требуют контроля"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
          <KpiCard
            label="Доля простоев"
            value="0.031"
            meta="доля от общего фонда"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
        </div>

        <KpiCard
          label="Общая выручка водителей"
          value="₽ 1 284 000"
          meta="за выбранный период"
          valueClassName="text-text-primary"
          metaClassName="text-accent-primary"
          className="min-w-0"
        />
      </section>

      <section className="flex flex-col gap-4">
        <TitledBlock
          title="Водители"
          subtitle="Пагинированный список по текущему фильтру"
          className="min-w-0"
        >
        <DataTable
          columns={driverColumns}
          data={filteredRows}
          initialPageSize={10}
          onRowClick={(row) => {
            navigate({ to: "/drivers/$id", params: { id: row.id } });
          }}
        />
      </TitledBlock>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TitledBlock
          title="Топ-3 водителей по выручке"
          subtitle="Лидеры по доходу за период"
          className="min-w-0"
          contentClassName="mt-2"
        >
          <div className="flex flex-col gap-3">
            {driversRevenueTop.map((item) => (
              <ProgressCard
                key={item.place}
                title={`${item.place}. ${item.title}`}
                secondaryText={item.secondaryText}
                value={item.value}
              />
            ))}
          </div>
        </TitledBlock>

        <TitledBlock
          title="Топ-3 автомобилей по эффективности"
          subtitle="Сравнение по выходу на линию"
          className="min-w-0"
          contentClassName="mt-2"
        >
          <div className="flex flex-col gap-3">
            {driversEfficiencyTop.map((item) => (
              <ProgressCard
                key={item.place}
                title={`${item.place}. ${item.title}`}
                secondaryText={item.secondaryText}
                value={item.value}
              />
            ))}
          </div>
        </TitledBlock>

        <TitledBlock
          title="Потери от простоев"
          subtitle="Оценка за последние 7 дней"
          topRightSlot={
            <AppText className="text-accent-primary text-3xl font-bold">
              ₽ 184K
            </AppText>
          }
          className="min-w-0"
          contentClassName="mt-2"
        >
          <div className="flex flex-col gap-2">
            <SummaryRow label="Ожидание заказа" value="₽ 74 000" />
            <SummaryRow label="Пересменка" value="₽ 56 000" />
            <SummaryRow label="Технический простой" value="₽ 54 000" />
          </div>
        </TitledBlock>

        <TitledBlock
          title="Потери из-за простоев автомобилей"
          subtitle="Разбивка по основным причинам"
          topRightSlot={
            <AppText className="text-accent-primary text-3xl font-bold">
              ₽ 1 284K
            </AppText>
          }
          className="min-w-0"
          contentClassName="mt-2"
        >
          <div className="flex flex-col gap-2">
            <SummaryRow label="Плановое ТО" value="₽ 612 000" />
            <SummaryRow label="Ожидание ремонта" value="₽ 434 000" />
            <SummaryRow label="Нет водителя" value="₽ 238 000" />
          </div>
        </TitledBlock>
      </section>
    </main>
  );
};
