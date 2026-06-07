import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";

import {
  vehicleDowntimeTopItems,
  vehicleEfficiencyTopItems,
  vehicleKpiCards,
  vehicleProfitabilityTopItems,
  vehicleTableColumns,
  vehicleTableData,
} from "../consts";

import { DataTable } from "@/features/data-table";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { ProgressCard } from "@/features/progress-card";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";
import { TitledBlock } from "@/features/titled-block";

type PeriodKey = "today" | "week" | "month" | "custom";

const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "custom", label: "Custom" },
];

export const DirectorVehiclesPage = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodKey>("month");

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={TAXIPARKS_SIDEBAR_NAV_BY_ID.vehicles.label}
        description="Управление автомобилями и анализ эффективности автопарка"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.vehicles.label },
        ]}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-3">
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

            <Button type="button" asChild className="h-10 rounded-[12px] px-4">
              <Link to="/vehicles/create">
                <Plus className="size-4" />
                Добавить автомобиль
              </Link>
            </Button>
          </div>
        }
      />

      <section className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {vehicleKpiCards.map((card) => (
            <KpiCard key={String(card.label)} {...card} />
          ))}
        </div>
      </section>

      <TitledBlock
        title="Список автомобилей"
        topRightSlot={
          <Button
            type="button"
            variant={BUTTON_VARIANTS_VARIABLES.tertiary}
            className="h-9 rounded-[12px] px-3.5"
            asChild
          >
            <Link to="/vehicles/create">
              <Plus className="size-4" />
              Добавить
            </Link>
          </Button>
        }
        className="min-w-0"
      >
        <DataTable
          columns={vehicleTableColumns}
          data={vehicleTableData}
          initialPageSize={5}
          onRowClick={(row) =>
            navigate({
              to: "/vehicles/$id",
              params: { id: row.plate },
            })
          }
        />
      </TitledBlock>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <TitledBlock
          title="Топ автомобилей по эффективности"
          className="min-w-0"
          contentClassName="mt-2"
        >
          <div className="flex flex-col gap-3">
            {vehicleEfficiencyTopItems.map((item) => (
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
          title="Самые прибыльные марки"
          className="min-w-0"
          contentClassName="mt-2"
        >
          <div className="flex flex-col gap-3">
            {vehicleProfitabilityTopItems.map((item) => (
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
          title="Минимальные простои"
          className="min-w-0"
          contentClassName="mt-2"
        >
          <div className="flex flex-col gap-3">
            {vehicleDowntimeTopItems.map((item) => (
              <ProgressCard
                key={item.place}
                title={`${item.place}. ${item.title}`}
                secondaryText={item.secondaryText}
                value={item.value}
              />
            ))}
          </div>
        </TitledBlock>
      </section>
    </main>
  );
};
