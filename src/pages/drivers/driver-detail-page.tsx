import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Info,
  PencilLine,
  UserPlus,
  UserRoundX,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { AppText } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { cn } from "@/shared/utils";

import { type DriverRow, getDriverMockById } from "./consts";
import { ConfirmDialog } from "@/features/confirm-dialog";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { ProgressCard } from "@/features/progress-card";
import { TitledBlock } from "@/features/titled-block/titled-block";
import { VerticalBarChart } from "@/features/vertical-bar-chart";

const moneyFormatter = new Intl.NumberFormat("ru-RU");
const percentFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export type DriverDetailMode = "internal" | "external";

interface DriverDetailPageProps {
  driverId: string;
  mode: DriverDetailMode;
}

type DetailChipProps = {
  children: ReactNode;
  tone?: "default" | "accent";
};

type ComparisonRowProps = {
  label: string;
  score: string;
  percent: number;
  caption: string;
  info: string;
};

const DetailChip = ({ children, tone = "default" }: DetailChipProps) => {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold",
        tone === "accent"
          ? "bg-accent-primary-soft text-accent-primary"
          : "bg-background-page text-text-primary",
      )}
    >
      {children}
    </span>
  );
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const buildRevenueChartData = (driver: DriverRow) =>
  Array.from({ length: 12 }).map((_, index) => {
    const day = 18 + index;
    const weekdayBoost = [
      0, 60, 140, 210, 280, 120, -40, 90, 180, 240, 300, 160,
    ][index];
    const value = Math.max(
      0,
      Math.round(driver.avgPerDay * 0.78 + weekdayBoost + driver.rank * 115),
    );

    return {
      date: `${String(day).padStart(2, "0")}.05`,
      value,
    };
  });

const ComparisonRow = ({
  label,
  score,
  percent,
  caption,
  info,
}: ComparisonRowProps) => {
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="bg-background-page rounded-[12px] px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <AppText className="text-text-primary text-sm font-semibold">
              {label}
            </AppText>
            <span title={info} className="inline-flex">
              <Info className="text-text-secondary size-3.5 shrink-0" />
            </span>
          </div>
        </div>

        <AppText className="text-text-primary text-sm font-bold tabular-nums">
          {score}
        </AppText>
      </div>

      <div className="bg-border-default/60 mt-3 h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-accent-primary h-full rounded-full transition-[width]"
          style={{ width: `${safePercent}%` }}
        />
      </div>

      <AppText className="text-text-secondary mt-2 text-xs font-medium">
        {caption}
      </AppText>
    </div>
  );
};

const ExternalDriverCard = ({
  driverName,
  driverInitials,
}: {
  driverName: string;
  driverInitials: string;
}) => {
  return (
    <section className="max-w-3xl">
      <CardSurface className="gap-6 rounded-[24px] p-6 md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="bg-accent-primary-soft text-accent-primary flex size-20 shrink-0 items-center justify-center rounded-[24px] text-2xl font-bold">
            {driverInitials}
          </div>

          <div className="min-w-0">
            <AppText className="text-text-secondary text-xs font-semibold tracking-[0.12em] uppercase">
              Внешний профиль
            </AppText>
            <AppText className="text-text-primary mt-2 text-2xl font-bold">
              {driverName}
            </AppText>
          </div>
        </div>
      </CardSurface>
    </section>
  );
};

const InternalDriverContent = ({
  driver,
  driverInitials,
  driverStatusLabel,
}: {
  driver: DriverRow;
  driverInitials: string;
  driverStatusLabel: string;
}) => {
  const revenueByDayData = buildRevenueChartData(driver);
  const revenueChartTotal = revenueByDayData.reduce(
    (total, item) => total + item.value,
    0,
  );
  const revenueMedian = Math.round(driver.avgPerDay * 0.89);
  const lineMedian = Math.max(85, Math.round(driver.exitPercent - 3.4));
  const idleMedian = Math.max(10, Math.round(driver.zeroDays * 4.5 + 8));
  const idleLossTotal = Math.round(driver.revenue * 0.12);
  const categoryRatings = [
    {
      label: "Пунктуальность",
      value: Math.min(5, 4.6 + driver.rank * 0.01),
    },
    {
      label: "Сервис",
      value: Math.min(5, 4.7 + driver.rank * 0.008),
    },
    {
      label: "Состояние авто",
      value: Math.min(5, 4.5 + driver.zeroDays * 0.03),
    },
    {
      label: "Стабильность",
      value: Math.min(5, 4.55 + driver.workdays * 0.004),
    },
  ];
  const comparisonRows = [
    {
      label: "Выручка / день",
      score: `${Math.round((driver.avgPerDay / revenueMedian) * 100)}%`,
      percent: Math.round((driver.avgPerDay / revenueMedian) * 100),
      caption: `Медиана: ₽ ${moneyFormatter.format(revenueMedian)}`,
      info: "Сравнение с медианой сегмента",
    },
    {
      label: "Выход на линию",
      score: `${percentFormatter.format(driver.exitPercent)}%`,
      percent: driver.exitPercent,
      caption: `Медиана: ${lineMedian}%`,
      info: "Стабильность выхода на смены",
    },
    {
      label: "0-дней",
      score: `${driver.zeroDays} дн.`,
      percent: Math.min(100, driver.zeroDays * 20),
      caption: `Медиана: ${Math.max(1, driver.zeroDays + 1)} дн.`,
      info: "Паузы между рабочими днями",
    },
  ];
  const idleLossRows = [
    {
      title: "Ожидание заказа",
      secondaryText: "46%",
      value: 46,
      footnote: `Медиана: ${idleMedian + 6}%`,
    },
    {
      title: "Пересменка",
      secondaryText: "31%",
      value: 31,
      footnote: `Медиана: ${idleMedian}%`,
    },
    {
      title: "Документы",
      secondaryText: "23%",
      value: 23,
      footnote: `Медиана: ${idleMedian - 4}%`,
    },
  ];

  return (
    <>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <CardSurface className="gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="bg-accent-primary-soft text-accent-primary flex size-14 shrink-0 items-center justify-center rounded-[18px] text-xl font-bold">
                  {driverInitials}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <AppText className="text-text-primary text-xl font-bold">
                      {driver.driver}
                    </AppText>
                    <DetailChip
                      tone={driver.status === "risk" ? "accent" : "default"}
                    >
                      {driverStatusLabel}
                    </DetailChip>
                  </div>

                  <AppText className="text-text-secondary mt-1 text-sm font-medium">
                    Автомобиль: {driver.car}
                  </AppText>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <DetailChip>Ранг #{driver.rank}</DetailChip>
                    <DetailChip>{driver.workdays} смен</DetailChip>
                    <DetailChip>0-дней: {driver.zeroDays}</DetailChip>
                    <DetailChip tone="accent">
                      {percentFormatter.format(driver.exitPercent)}% выхода
                    </DetailChip>
                  </div>
                </div>
              </div>
            </div>
          </CardSurface>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KpiCard
              label="Выручка"
              value={`₽ ${moneyFormatter.format(driver.revenue)}`}
              meta="за текущий период"
              valueClassName="text-text-primary"
              metaClassName="text-accent-primary"
              className="min-w-0"
            />
            <KpiCard
              label="Средняя / день"
              value={`₽ ${moneyFormatter.format(driver.avgPerDay)}`}
              meta="выход по сменам"
              valueClassName="text-text-primary"
              metaClassName="text-accent-primary"
              className="min-w-0"
            />
            <KpiCard
              label="Выход на линию"
              value={`${percentFormatter.format(driver.exitPercent)}%`}
              meta="от запланированных смен"
              valueClassName="text-text-primary"
              metaClassName="text-accent-primary"
              className="min-w-0"
            />
            <KpiCard
              label="Рабочих дней"
              value={String(driver.workdays)}
              meta={`${driver.zeroDays} нулевых дней`}
              valueClassName="text-text-primary"
              metaClassName="text-accent-primary"
              className="min-w-0"
            />
          </section>
        </div>

        <TitledBlock
          title="Рейтинг по категориям"
          subtitle="Оценка за последние 30 дней"
          topRightSlot={<DetailChip tone="accent">4 категории</DetailChip>}
          className="min-w-0 gap-3"
        >
          <div className="flex flex-col gap-2">
            {categoryRatings.map((item) => (
              <div
                key={item.label}
                className="bg-background-page flex items-center justify-between gap-3 rounded-[12px] px-4 py-3"
              >
                <AppText className="text-text-primary text-sm font-semibold">
                  {item.label}
                </AppText>
                <span className="bg-accent-primary-soft text-accent-primary inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold tabular-nums">
                  {item.value.toFixed(1)}/5
                </span>
              </div>
            ))}
          </div>
        </TitledBlock>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <TitledBlock
          title="Сравнение с медианой"
          subtitle="Ключевые показатели относительно сегмента"
          topRightSlot={<DetailChip>3 метрики</DetailChip>}
          className="min-w-0 gap-3"
        >
          <div className="flex flex-col gap-2">
            {comparisonRows.map((item) => (
              <ComparisonRow
                key={item.label}
                label={item.label}
                score={item.score}
                percent={item.percent}
                caption={item.caption}
                info={item.info}
              />
            ))}
          </div>
        </TitledBlock>

        <TitledBlock
          title="Потери от простоев"
          subtitle="Разбивка по основным причинам"
          topRightSlot={
            <div className="text-right">
              <AppText className="text-accent-primary text-3xl font-bold tabular-nums">
                ₽ {moneyFormatter.format(idleLossTotal)}
              </AppText>
              <AppText className="text-text-secondary mt-1 text-sm font-medium">
                +12% к медиане сегмента
              </AppText>
            </div>
          }
          className="min-w-0 gap-3"
        >
          <div className="flex flex-col gap-3">
            {idleLossRows.map((item) => (
              <ProgressCard
                key={item.title}
                title={item.title}
                secondaryText={item.secondaryText}
                value={item.value}
                footnote={item.footnote}
              />
            ))}
          </div>
        </TitledBlock>
      </section>

      <CardSurface className="min-w-0 gap-3">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <AppText className="text-text-primary text-lg font-bold">
              Выручка по дням
            </AppText>
            <AppText className="text-text-secondary mt-1 text-sm font-medium">
              12 последних смен
            </AppText>
          </div>

          <AppText className="text-accent-primary text-3xl font-bold tabular-nums">
            ₽ {moneyFormatter.format(Math.round(revenueChartTotal / 1000))}K
          </AppText>
        </div>

        <VerticalBarChart
          data={revenueByDayData}
          valueLabel="₽ / день"
          barFill="#ff7a0266"
          activeBarFill="#ff7a02"
          xTickFormatter={(date) => date}
          yTickFormatter={(value) => `₽ ${Math.round(value / 1000)}K`}
          tooltipDateFormatter={(date) => `День ${date}`}
          tooltipValueFormatter={(value) => `₽ ${moneyFormatter.format(value)}`}
          height={220}
        />
      </CardSurface>
    </>
  );
};

export const DriverDetailPage = ({ driverId, mode }: DriverDetailPageProps) => {
  const navigate = useNavigate();

  const driver = getDriverMockById(driverId);
  const driverStatusLabel = driver.status === "active" ? "Активен" : "Риск";
  const driverInitials = getInitials(driver.driver);

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Карточка водителя"
        description="Обновлено: сегодня 09:40"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Водители", href: "/drivers" },
        ]}
        actions={
          mode === "external" ? (
            <>
              <Button
                type="button"
                variant={BUTTON_VARIANTS_VARIABLES.secondary}
                onClick={() => navigate({ to: "/drivers" })}
              >
                <ArrowLeft className="size-4" />
                Назад
              </Button>

              <ConfirmDialog
                title={`Пригласить ${driver.driver} в таксопарк?`}
                description={
                  <>
                    Мы отправим приглашение водителю {driver.driver}. В текущей
                    версии это только UI-flow без изменения mock-данных.
                  </>
                }
                confirmText={"Пригласить"}
                cancelText={"Отмена"}
                confirmVariant={BUTTON_VARIANTS_VARIABLES.default}
                media={
                  <div className="bg-accent-primary-soft text-accent-primary flex size-12 items-center justify-center rounded-full">
                    <UserPlus className="size-6" />
                  </div>
                }
                onConfirm={() => {}}
                trigger={
                  <Button type="button">
                    <UserPlus className="size-4" />
                    Пригласить в таксопарк
                  </Button>
                }
              />
            </>
          ) : (
            <>
              <Button
                type="button"
                variant={BUTTON_VARIANTS_VARIABLES.secondary}
                onClick={() => navigate({ to: "/drivers" })}
              >
                <ArrowLeft className="size-4" />
                Назад
              </Button>

              <Button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/drivers/$id/edit",
                    params: { id: driverId },
                  })
                }
              >
                <PencilLine className="size-4" />
                Редактировать
              </Button>

              <ConfirmDialog
                title={`Уволить водителя ${driver.driver}?`}
                description={`В локальном UI-сценарии действие не изменит данные, но позволит проверить destructive flow для водителя ${driver.driver}.`}
                confirmText="Уволить"
                trigger={
                  <Button
                    type="button"
                    variant={BUTTON_VARIANTS_VARIABLES.destructive}
                  >
                    <UserRoundX className="size-4" />
                    Уволить
                  </Button>
                }
              />
            </>
          )
        }
      />

      {mode === "external" ? (
        <ExternalDriverCard
          driverName={driver.driver}
          driverInitials={driverInitials}
        />
      ) : (
        <InternalDriverContent
          driver={driver}
          driverInitials={driverInitials}
          driverStatusLabel={driverStatusLabel}
        />
      )}
    </main>
  );
};
