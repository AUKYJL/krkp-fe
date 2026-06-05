import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";

import { AppText } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { columns, donutPieChartMockData, tableMockData } from "./consts";
import { BestIndicatorItem, StatusBadge } from "./ui";
import { CsvExportButton } from "@/features/csv-export-button";
import { DataTable } from "@/features/data-table";
import { DonutPieChart } from "@/features/donut-pie-chart";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { ProgressCard } from "@/features/progress-card";
import { SearchInput } from "@/features/search-input";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";
import { TitledBlock } from "@/features/titled-block";

export const TaxiParksPage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const query = search.trim().toLowerCase();
  const filteredTableData =
    query.length === 0
      ? tableMockData
      : tableMockData.filter((row) => row.name.toLowerCase().includes(query));

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={TAXIPARKS_SIDEBAR_NAV_BY_ID.taxiparks.label}
        description="Управление таксопарками и анализ финансовой эффективности"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.taxiparks.label },
        ]}
        actions={
          <>
            <Button variant={BUTTON_VARIANTS_VARIABLES.secondary}>
              <CalendarDays className="size-4" />
              30 дней
            </Button>

            <Button>
              <Plus className="size-4" />
              Создать таксопарк
            </Button>
          </>
        }
      />

      <section className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Общее количество таксопарков"
            value="24"
            meta="+3 за месяц"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
          <KpiCard
            label="Общая выручка"
            value="₽ 18 420 000"
            meta="+14.8%"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
          <KpiCard
            label="Средняя выручка на водителя"
            value="₽ 184 200"
            meta="формула ниже"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
          <KpiCard
            label="Активные автомобили"
            value="1 248"
            meta="86% парка"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <KpiCard
            label="Аварийные автомобили"
            value="37"
            meta="требуют ремонта"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
          <KpiCard
            label="Не вышли на линию"
            value="11.4%"
            meta="-2.1% к неделе"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
          <KpiCard
            label="Потери от простоев"
            value="₽ 942 000"
            meta="важный показатель"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
            className="min-w-0"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-4">
        <TitledBlock
          title={
            <span className="inline-flex flex-col">
              <span>Распределение</span>
              <span>выручки</span>
            </span>
          }
          subtitle="По паркам за текущий месяц"
          headerClassName="items-center"
          topRightSlot={<StatusBadge label="Исправен" />}
          className="min-w-0"
        >
          <DonutPieChart
            data={donutPieChartMockData}
            centerLabel="2.8M"
            centerSubLabel="руб."
          />
        </TitledBlock>

        <TitledBlock
          title="Рейтинг таксопарков"
          subtitle="Лидеры по выполнению плана"
          className="min-w-0"
        >
          <div className="flex flex-col gap-3">
            <div className="text-text-secondary grid grid-cols-[1fr_80px_120px] gap-3 text-xs font-semibold">
              <span>Парк</span>
              <span>План</span>
              <span>Статус</span>
            </div>

            {[
              { park: "Северный", plan: "118%", status: "Исправен" },
              { park: "Город", plan: "104%", status: "Исправен" },
              { park: "Экспресс", plan: "91%", status: "Исправен" },
            ].map((row) => (
              <div
                key={row.park}
                className="grid grid-cols-[1fr_80px_120px] items-center gap-3"
              >
                <AppText className="text-text-primary text-sm font-medium">
                  {row.park}
                </AppText>
                <AppText className="text-text-primary text-sm font-medium tabular-nums">
                  {row.plan}
                </AppText>
                <div>
                  <StatusBadge label={row.status} />
                </div>
              </div>
            ))}
          </div>
        </TitledBlock>

        <TitledBlock
          title="Потери от простоя"
          subtitle="Оценка за последние 7 дней"
          headerClassName="items-center"
          topRightSlot={
            <AppText className="text-accent-primary text-3xl font-bold">
              ₽ 184K
            </AppText>
          }
          className="min-w-0"
        >
          <div className="flex flex-col gap-4">
            <ProgressCard
              title="Ожидание ремонта"
              secondaryText="62%"
              value={62}
            />
            <ProgressCard title="Нет водителя" secondaryText="24%" value={24} />
            <ProgressCard title="Документы" secondaryText="14%" value={14} />
          </div>
        </TitledBlock>

        <TitledBlock title="Лучшие показатели" className="min-w-0">
          <div className="flex flex-col gap-3">
            <BestIndicatorItem
              title="Парк Северный"
              subtitle="Самый высокий чек"
              value="₽ 1 940"
            />
            <BestIndicatorItem
              title="Город Такси"
              subtitle="Минимальный простой"
              value="1.8 ч"
            />
            <BestIndicatorItem
              title="Экспресс"
              subtitle="Выполнение SLA"
              value="98%"
            />
          </div>
        </TitledBlock>
      </section>

      <TitledBlock
        title="Мои Таксопарки"
        subtitle="Список таксопарков с финансовыми и операционными показателями"
        headerClassName="items-center"
        topRightSlot={
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={(value) => setSearch(value)}
              className="w-96"
              placeholder="Поиск по таксопаркам"
            />
            <CsvExportButton
              columns={columns}
              data={filteredTableData}
              fileName="taxiparks"
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredTableData}
          initialPageSize={10}
          onRowClick={(row) => {
            navigate({ to: "/taxiparks/$id", params: { id: row.id } });
          }}
        />
      </TitledBlock>
    </main>
  );
};
