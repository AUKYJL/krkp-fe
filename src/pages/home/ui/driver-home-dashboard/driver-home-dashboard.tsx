import { useNavigate } from "@tanstack/react-router";
import { Building2, CarFront, TriangleAlert } from "lucide-react";

import type { CurrentUser } from "@/shared/api/auth";
import {
  AppText,
  TAG,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS_VARIABLES,
} from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";

import { buildDriverHomeDashboardData } from "../../consts/driver-home-mock-data";

import { DashboardPill, SummaryRow } from "./dashboard-primitives";
import {
  formatDashboardDate,
  getCarStatusConfig,
  getRecentDayStatusConfig,
} from "./driver-home-dashboard.utils";
import { TodayRevenueCard } from "./today-revenue-card";
import { KpiCard } from "@/features/kpi-card";
import { TitledBlock } from "@/features/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";

const moneyFormatter = new Intl.NumberFormat("ru-RU");

type DriverHomeDashboardProps = {
  currentUser: CurrentUser;
};

export const DriverHomeDashboard = ({
  currentUser,
}: DriverHomeDashboardProps) => {
  const navigate = useNavigate();
  const dashboard = buildDriverHomeDashboardData(currentUser.fullName);
  const currentDate = formatDashboardDate(new Date());
  const carStatus = getCarStatusConfig(dashboard.car.status);

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <div className="flex gap-2">
        <CardSurface className="flex-1 gap-5 rounded-[24px] p-6 md:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <AppText className="text-text-secondary text-xs font-semibold tracking-[0.12em] uppercase">
                Главная
              </AppText>

              <AppText
                tag={TAG.h1}
                size={TEXT_SIZES_VARIABLES.large}
                className="text-text-primary mt-2 font-bold"
              >
                {dashboard.driverName}
              </AppText>

              <AppText className="text-text-secondary mt-1 text-sm font-medium">
                {currentDate}
              </AppText>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <DashboardPill
                  label={dashboard.statusLabel}
                  tone={dashboard.statusTone}
                />
                <AppText
                  variant={TEXT_VARIANTS_VARIABLES.main}
                  size={TEXT_SIZES_VARIABLES.xs}
                  className="text-text-secondary font-medium"
                >
                  {dashboard.shiftHint}
                </AppText>
              </div>
              <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap xl:w-auto">
                {dashboard.isOnLine ? (
                  <Button
                    type="button"
                    className="min-w-[168px]"
                    onClick={() => undefined}
                  >
                    Завершить смену
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="min-w-[168px]"
                    onClick={() => undefined}
                  >
                    Выйти на линию
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardSurface>
        <TodayRevenueCard
          initialRevenue={dashboard.todayRevenue.amount}
          initialUpdatedAt={dashboard.todayRevenue.updatedAt}
          canEdit={dashboard.todayRevenue.canEdit}
        />
      </div>

      <TitledBlock
        title="Назначенный автомобиль"
        subtitle="Актуальные данные по автомобилю на смене"
        topRightSlot={
          <DashboardPill label={carStatus.label} tone={carStatus.tone} />
        }
        className="gap-5"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="border-border-default bg-background-page flex h-[168px] w-full shrink-0 items-center justify-center rounded-[18px] border lg:w-[220px]">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="bg-accent-primary-soft text-accent-primary flex size-14 items-center justify-center rounded-full">
                <CarFront className="size-7" />
              </div>
              <div>
                <AppText className="text-text-primary text-sm font-semibold">
                  {dashboard.car.brand} {dashboard.car.model}
                </AppText>
                <AppText className="text-text-secondary text-xs font-medium">
                  Автомобиль на текущую смену
                </AppText>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
            <SummaryRow label="Марка" value={dashboard.car.brand} />
            <SummaryRow label="Модель" value={dashboard.car.model} />
            <SummaryRow label="Госномер" value={dashboard.car.plate} />
            <SummaryRow label="Статус" value={carStatus.label} />
            <SummaryRow
              label="Последнее ТО"
              value={dashboard.car.lastMaintenanceDate}
            />
          </div>
        </div>

        {dashboard.car.warning ? (
          <div className="bg-background-page mt-4 flex items-start gap-3 rounded-[14px] px-4 py-3">
            <TriangleAlert className="text-accent-primary mt-0.5 size-4 shrink-0" />
            <AppText className="text-text-primary text-sm font-medium">
              {dashboard.car.warning}
            </AppText>
          </div>
        ) : null}
      </TitledBlock>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dashboard.kpiCards.map((card) => (
          <KpiCard key={String(card.label)} {...card} />
        ))}
      </section>

      <TitledBlock
        title="Динамика выручки"
        subtitle="Последние 7 дней"
        topRightSlot={<DashboardPill label="7 дней" />}
      >
        <VerticalBarChart
          data={dashboard.revenueByDayData}
          valueLabel="Выручка, ₽"
          height={300}
          yTickFormatter={(value) =>
            Intl.NumberFormat("ru-RU", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(value)
          }
          tooltipValueFormatter={(value) => `${moneyFormatter.format(value)} ₽`}
        />
      </TitledBlock>

      <TitledBlock
        title="Последние рабочие дни"
        subtitle="Последние 5 записей по выручке"
      >
        <div className="flex flex-col gap-2">
          {dashboard.recentWorkDays.map((day) => {
            const status = getRecentDayStatusConfig(day.status);

            return (
              <div
                key={day.date}
                className="bg-background-page flex flex-col gap-3 rounded-[12px] px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center">
                  <AppText className="text-text-primary text-sm font-semibold">
                    {day.date}
                  </AppText>
                  <AppText className="text-text-secondary text-sm font-medium">
                    {day.revenue != null
                      ? `${moneyFormatter.format(day.revenue)} ₽`
                      : "Нет данных"}
                  </AppText>
                  <DashboardPill label={status.label} tone={status.tone} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <Button
            type="button"
            variant={BUTTON_VARIANTS_VARIABLES.secondary}
            onClick={() => navigate({ to: "/finance" })}
          >
            Перейти к истории выручки
          </Button>
        </div>
      </TitledBlock>

      {dashboard.fleet.type === "invited" ? (
        <CardSurface className="gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-accent-primary-soft text-accent-primary flex size-10 shrink-0 items-center justify-center rounded-full">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <AppText
                tag={TAG.h2}
                size={TEXT_SIZES_VARIABLES.default}
                className="text-text-primary font-semibold"
              >
                Вас пригласили в таксопарк
              </AppText>
              <AppText className="text-text-secondary mt-1 text-sm font-medium">
                Приглашение от {dashboard.fleet.name} ожидает вашего решения.
              </AppText>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" className="sm:min-w-[168px]">
              Принять приглашение
            </Button>
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              className="sm:min-w-[168px]"
            >
              Отклонить
            </Button>
          </div>
        </CardSurface>
      ) : (
        <CardSurface className="gap-5 rounded-[24px] p-6 md:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <AppText className="text-text-secondary text-xs font-semibold tracking-[0.12em] uppercase">
                Таксопарк
              </AppText>

              <AppText
                tag={TAG.h2}
                size={TEXT_SIZES_VARIABLES.medium}
                className="text-text-primary mt-2 font-bold"
              >
                {dashboard.fleet.name}
              </AppText>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <DashboardPill label={dashboard.fleet.status} />
                <AppText
                  variant={TEXT_VARIANTS_VARIABLES.main}
                  size={TEXT_SIZES_VARIABLES.xs}
                  className="text-text-secondary font-medium"
                >
                  В таксопарке с {dashboard.fleet.joinedAt}
                </AppText>
              </div>
            </div>
          </div>
        </CardSurface>
      )}
    </main>
  );
};
