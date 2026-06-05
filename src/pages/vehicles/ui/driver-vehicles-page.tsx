import { CarFront, CircleCheckBig, TriangleAlert, Wrench } from "lucide-react";

import type { CurrentUser } from "@/shared/api/auth";
import { ROLES } from "@/shared/types";
import { AppText, TAG, TEXT_SIZES_VARIABLES } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { can, cn } from "@/shared/utils";

import { PageHeader } from "@/features/page-header/page-header";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";

import {
  buildDriverVehiclePageData,
  formatVehicleMileage,
  getDriverVehicleStatusConfig,
} from "./driver-vehicles-page.utils";

type DriverVehiclesPageProps = {
  currentUser: CurrentUser;
};

type SummaryRowProps = {
  label: string;
  value: string;
};

const DriverVehicleStatusBadge = ({
  label,
  tone,
}: {
  label: string;
  tone: "default" | "accent" | "muted";
}) => {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-[10px] px-3 text-xs font-semibold",
        tone === "default" && "bg-accent-primary-soft text-text-primary",
        tone === "accent" && "bg-dark-primary-soft text-text-primary",
        tone === "muted" &&
          "border-border-default bg-background-page text-text-secondary border",
      )}
    >
      {label}
    </span>
  );
};

const SummaryRow = ({ label, value }: SummaryRowProps) => {
  return (
    <div className="bg-background-page flex items-center justify-between gap-4 rounded-[12px] px-4 py-3">
      <AppText className="text-text-primary text-sm font-medium">
        {label}
      </AppText>
      <AppText className="text-text-primary text-right text-sm font-semibold tabular-nums">
        {value}
      </AppText>
    </div>
  );
};

export const DriverVehiclesPage = ({
  currentUser,
}: DriverVehiclesPageProps) => {
  const data = buildDriverVehiclePageData(currentUser);
  const vehicle = data.vehicle;

  if (!vehicle) {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Мой автомобиль"
          description="Информация о назначенном автомобиле и его текущем состоянии"
          breadcrumbs={[
            { label: "Главная", href: "/" },
            { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.vehicles.label },
          ]}
        />

        <CardSurface className="items-center justify-center gap-3 rounded-[24px] px-6 py-12 text-center">
          <div className="bg-accent-primary-soft text-accent-primary flex size-14 items-center justify-center rounded-full">
            <CarFront className="size-7" />
          </div>
          <AppText
            tag={TAG.h2}
            size={TEXT_SIZES_VARIABLES.medium}
            className="text-text-primary font-semibold"
          >
            У вас пока нет назначенного автомобиля
          </AppText>
          <AppText className="text-text-secondary max-w-[440px] text-sm font-medium">
            Обратитесь к директору таксопарка для назначения автомобиля
          </AppText>
        </CardSurface>
      </main>
    );
  }

  const status = getDriverVehicleStatusConfig(vehicle.status);
  const hasActiveProblems = vehicle.activeProblems.length > 0;
  const canManageShift = can(currentUser.role, [ROLES.DRIVER]);
  const canGoOnLine =
    canManageShift &&
    !data.isOnLine &&
    vehicle.canGoOnLine &&
    !hasActiveProblems;
  const disabledReason = vehicle.restrictionReason ?? "Автомобиль временно недоступен для выхода на линию.";

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Мой автомобиль"
        description="Информация о назначенном автомобиле и его текущем состоянии"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.vehicles.label },
        ]}
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <CardSurface className="gap-6 rounded-[24px] p-6 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 gap-4">
              <div className="bg-accent-primary-soft text-accent-primary flex size-16 shrink-0 items-center justify-center rounded-[18px]">
                <CarFront className="size-8" />
              </div>

              <div className="min-w-0">
                <AppText className="text-text-secondary text-xs font-semibold tracking-[0.12em] uppercase">
                  Назначенный автомобиль
                </AppText>
                <AppText
                  tag={TAG.h2}
                  size={TEXT_SIZES_VARIABLES.medium}
                  className="text-text-primary mt-2 font-bold"
                >
                  {vehicle.brand} {vehicle.model}
                </AppText>
                <AppText className="text-text-secondary mt-1 text-sm font-medium">
                  Госномер: {vehicle.plate}
                </AppText>
              </div>
            </div>

            <DriverVehicleStatusBadge label={status.label} tone={status.tone} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <SummaryRow label="Статус" value={status.label} />
            <SummaryRow
              label="Пробег"
              value={formatVehicleMileage(vehicle.mileageKm)}
            />
            <SummaryRow
              label="Последнее ТО"
              value={vehicle.lastMaintenanceDate}
            />
            <SummaryRow
              label="Следующее ТО"
              value={vehicle.nextMaintenanceDate}
            />
            <SummaryRow
              label="Выход на линию"
              value={canGoOnLine || data.isOnLine ? "Разрешен" : "Ограничен"}
            />
            <SummaryRow label="Водитель" value={data.driverName} />
          </div>

          <div className="flex flex-col gap-3">
            {data.isOnLine ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <DriverVehicleStatusBadge label="Вы на линии" tone="default" />
                {data.canCompleteShift ? (
                  <Button
                    type="button"
                    variant={BUTTON_VARIANTS_VARIABLES.secondary}
                    className="sm:min-w-[168px]"
                  >
                    Завершить смену
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="w-full sm:w-auto sm:min-w-[168px]"
                  disabled={!canGoOnLine}
                >
                  Выйти на линию
                </Button>
                {!canGoOnLine ? (
                  <AppText className="text-text-secondary text-sm font-medium">
                    {disabledReason}
                  </AppText>
                ) : null}
              </div>
            )}
          </div>
        </CardSurface>

        <CardSurface className="gap-4 rounded-[24px] p-6">
          <div className="flex items-start gap-3">
            <div className="bg-background-page flex size-11 shrink-0 items-center justify-center rounded-[14px]">
              {vehicle.canGoOnLine && !hasActiveProblems ? (
                <CircleCheckBig className="text-accent-primary size-5" />
              ) : hasActiveProblems ? (
                <TriangleAlert className="text-dark-primary size-5" />
              ) : (
                <Wrench className="text-text-secondary size-5" />
              )}
            </div>
            <div className="min-w-0">
              <AppText
                tag={TAG.h2}
                size={TEXT_SIZES_VARIABLES.default}
                className="text-text-primary font-semibold"
              >
                Состояние
              </AppText>

              {vehicle.canGoOnLine && !hasActiveProblems ? (
                <AppText className="text-text-secondary mt-1 text-sm font-medium">
                  Автомобиль исправен. Можно выходить на линию.
                </AppText>
              ) : (
                <>
                  <AppText className="text-text-primary mt-1 text-sm font-semibold">
                    {status.label}
                  </AppText>
                  <AppText className="text-text-secondary mt-1 text-sm font-medium">
                    Причина:{" "}
                    {vehicle.restrictionReason ??
                      vehicle.activeProblems[0] ??
                      "Есть ограничения по состоянию автомобиля."}
                  </AppText>
                </>
              )}
            </div>
          </div>

          <div className="bg-background-page rounded-[16px] px-4 py-3">
            <AppText className="text-text-secondary text-xs font-semibold tracking-[0.12em] uppercase">
              Доступ к смене
            </AppText>
            <AppText className="text-text-primary mt-2 text-sm font-semibold">
              {canGoOnLine
                ? "Выход на линию доступен"
                : data.isOnLine
                  ? "Смена уже начата"
                  : "Выход на линию ограничен"}
            </AppText>
            {!canGoOnLine && !data.isOnLine ? (
              <AppText className="text-text-secondary mt-1 text-sm font-medium">
                {disabledReason}
              </AppText>
            ) : null}
          </div>
        </CardSurface>
      </section>

      <CardSurface className="gap-4 rounded-[24px] p-6">
        <AppText
          tag={TAG.h2}
          size={TEXT_SIZES_VARIABLES.default}
          className="text-text-primary font-semibold"
        >
          Активные проблемы
        </AppText>

        {hasActiveProblems ? (
          <div className="flex flex-col gap-2">
            {vehicle.activeProblems.map((problem) => (
              <div
                key={problem}
                className="bg-background-page flex items-start gap-3 rounded-[14px] px-4 py-3"
              >
                <TriangleAlert className="text-dark-primary mt-0.5 size-4 shrink-0" />
                <AppText className="text-text-primary text-sm font-medium">
                  {problem}
                </AppText>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-background-page rounded-[14px] px-4 py-3">
            <AppText className="text-text-secondary text-sm font-medium">
              Активных проблем нет
            </AppText>
          </div>
        )}
      </CardSurface>
    </main>
  );
};
