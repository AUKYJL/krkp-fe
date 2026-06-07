import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/features/data-table";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { TitledBlock } from "@/features/titled-block";
import {
  useDirectorVehiclesCatalog,
  type DirectorVehicleListItem,
  getVehicleStateMeta,
} from "@/pages/vehicles/model";
import { AppText } from "@/shared/ui/app-text";

import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";
import { AnalyticsStateCard, StatusBadge } from "@/pages/taxiparks/ui";

const directorVehicleColumns: ColumnDef<DirectorVehicleListItem>[] = [
  {
    accessorKey: "plateNumber",
    header: "Номер",
    cell: ({ row }) => (
      <span className="text-sm font-semibold tabular-nums">
        {row.original.plateNumber}
      </span>
    ),
  },
  {
    id: "vehicle",
    header: "Автомобиль",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-semibold">
          {row.original.firm} {row.original.model}
        </span>
        <span className="text-text-secondary text-xs font-medium">
          ID: {row.original.carId}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "state",
    header: "Состояние",
    cell: ({ row }) => {
      const state = getVehicleStateMeta(row.original.state);

      return <StatusBadge label={state.label} tone={state.tone} />;
    },
  },
  {
    accessorKey: "taxiParkName",
    header: "Таксопарк",
  },
  {
    accessorKey: "assignedDriverName",
    header: "Назначенный водитель",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.assignedDriverName ?? "Не назначен"}
      </span>
    ),
  },
];

export const DirectorVehiclesPage = () => {
  const navigate = useNavigate();
  const catalogQuery = useDirectorVehiclesCatalog();

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={TAXIPARKS_SIDEBAR_NAV_BY_ID.vehicles.label}
        description="Каталог автомобилей из доступных вам таксопарков."
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.vehicles.label },
        ]}
      />

      {catalogQuery.isLoading ? (
        <AnalyticsStateCard
          title="Загружаем каталог автомобилей"
          message="Собираем машины из доступных вам таксопарков."
          tone="loading"
        />
      ) : catalogQuery.error ? (
        <AnalyticsStateCard
          title="Не удалось загрузить каталог автомобилей"
          message={catalogQuery.errorMessage}
          tone="error"
          actionLabel="Повторить"
          onAction={() => {
            void catalogQuery.refetch();
          }}
        />
      ) : catalogQuery.data == null || catalogQuery.data.vehicles.length === 0 ? (
        <AnalyticsStateCard
          title="Автомобили не найдены"
          message="В доступных вам таксопарках пока нет автомобилей."
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <KpiCard label="Всего автомобилей" value={catalogQuery.data.summary.total} />
            <KpiCard label="На линии" value={catalogQuery.data.summary.working} />
            <KpiCard label="В ремонте" value={catalogQuery.data.summary.repair} />
            <KpiCard label="Аварийные" value={catalogQuery.data.summary.emergency} />
            <KpiCard
              label="С назначенным водителем"
              value={catalogQuery.data.summary.withAssignedDriver}
              meta={`${catalogQuery.data.summary.withoutAssignedDriver} без водителя`}
            />
          </section>

          <TitledBlock
            title="Список автомобилей"
            subtitle={`${catalogQuery.data.taxiParks.length} таксопарков в каталоге`}
          >
            <DataTable
              columns={directorVehicleColumns}
              data={catalogQuery.data.vehicles}
              initialPageSize={10}
              onRowClick={(row) => {
                navigate({
                  to: "/vehicles/$id",
                  params: { id: row.carId },
                });
              }}
            />
          </TitledBlock>

          <AppText className="text-text-secondary text-sm font-medium">
            Клик по строке открывает аналитику автомобиля за выбранный период.
          </AppText>
        </>
      )}
    </main>
  );
};
