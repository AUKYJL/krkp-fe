import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CarFront, PencilLine, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/features/confirm-dialog";
import {
  AppText,
  TAG,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS_VARIABLES,
} from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { cn } from "@/shared/utils";

import {
  getVehicleDetailMockByPlate,
  getVehicleStatusConfig,
  vehicleTableData,
} from "./consts";
import { KpiCard } from "@/features/kpi-card";
import { PageHeader } from "@/features/page-header/page-header";
import { VerticalBarChart } from "@/features/vertical-bar-chart";

const moneyFormatter = new Intl.NumberFormat("ru-RU");

interface VehicleDetailPageProps {
  vehiclePlate: string;
}

type DetailChipProps = {
  label: string;
  className?: string;
};

const DetailChip = ({ label, className }: DetailChipProps) => {
  return (
    <span
      className={cn(
        "bg-background-page text-text-primary inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold",
        className,
      )}
    >
      {label}
    </span>
  );
};

export const VehicleDetailPage = ({ vehiclePlate }: VehicleDetailPageProps) => {
  const navigate = useNavigate();
  const vehicle = getVehicleDetailMockByPlate(vehiclePlate);
  const vehicleRow = vehicleTableData.find((row) => row.plate === vehiclePlate);
  const handleDeleteConfirm = () => undefined;
  const handleDeleteCancel = () => undefined;

  if (!vehicle || !vehicleRow) {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Автомобиль не найден"
          description="Проверьте номер или вернитесь к списку автомобилей."
          breadcrumbs={[
            { label: "Главная", href: "/" },
            { label: "Автомобили", href: "/vehicles" },
          ]}
          actions={
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={() => navigate({ to: "/vehicles" })}
            >
              <ArrowLeft className="size-4" />
              Назад
            </Button>
          }
        />

        <CardSurface className="gap-3">
          <AppText
            tag={TAG.h2}
            size={TEXT_SIZES_VARIABLES.default}
            className="text-text-primary font-semibold"
          >
            Данные по автомобилю отсутствуют
          </AppText>
          <AppText className="text-text-secondary text-sm font-medium">
            Для этой страницы используется локальный mock. Доступны номера из
            таблицы на странице автопарка.
          </AppText>
        </CardSurface>
      </main>
    );
  }

  const statusConfig = getVehicleStatusConfig(vehicleRow.status);
  const revenueTotal = vehicle.revenueSeries.reduce(
    (total, item) => total + item.value,
    0,
  );

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={vehicle.title}
        description={vehicle.description}
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Автомобили", href: "/vehicles" },
          { label: vehicleRow.plate },
        ]}
        actions={
          <>
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={() => navigate({ to: "/vehicles" })}
            >
              <ArrowLeft className="size-4" />
              Назад
            </Button>

            <Button
              type="button"
              onClick={() =>
                navigate({
                  to: "/vehicles/$id/edit",
                  params: { id: vehiclePlate },
                })
              }
            >
              <PencilLine className="size-4" />
              Редактировать
            </Button>

            <ConfirmDialog
              trigger={
                <Button
                  type="button"
                  variant={BUTTON_VARIANTS_VARIABLES.destructive}
                >
                  <Trash2 className="size-4" />
                  Удалить автомобиль
                </Button>
              }
              title={`Удалить автомобиль ${vehicleRow.plate}?`}
              description={
                <>
                  Вы подтверждаете удаление автомобиля {vehicle.title}. На
                  текущем этапе это только UI-сценарий без реального удаления
                  записи.
                </>
              }
              onConfirm={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
            />
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_320px]">
        <CardSurface className="gap-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <div className="border-border-default bg-background-page flex h-[220px] w-full shrink-0 items-center justify-center rounded-[18px] border lg:w-[280px]">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="bg-accent-primary-soft text-accent-primary flex size-14 items-center justify-center rounded-full">
                  <CarFront className="size-7" />
                </div>
                <div>
                  <AppText className="text-text-primary text-sm font-semibold">
                    Фото автомобиля
                  </AppText>
                  <AppText className="text-text-secondary text-xs font-medium">
                    {vehicle.photoLabel}
                  </AppText>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <AppText
                    tag={TAG.h2}
                    size={TEXT_SIZES_VARIABLES.large}
                    className="text-text-primary font-bold"
                  >
                    {vehicleRow.brand}
                  </AppText>
                  <AppText className="text-text-secondary mt-1 text-sm font-medium">
                    Номер: {vehicleRow.plate}
                  </AppText>
                </div>

                <span
                  className={cn(
                    "inline-flex h-8 items-center rounded-[10px] px-3 text-xs font-semibold",
                    statusConfig.className,
                  )}
                >
                  {statusConfig.label}
                </span>
              </div>

              <AppText className="text-text-secondary mt-3 max-w-2xl text-sm font-medium">
                Обновлено: {vehicle.updatedAt}
              </AppText>

              <div className="mt-4 flex flex-wrap gap-2">
                <DetailChip label={`Водитель: ${vehicleRow.driver}`} />
                <DetailChip label={`Парк: ${vehicleRow.park}`} />
                <DetailChip
                  label={`${vehicleRow.workdays} рабочих дней`}
                  className="text-accent-primary"
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {vehicle.summaryCards.map((card) => (
                  <div
                    key={card.label}
                    className="bg-background-page rounded-[14px] px-4 py-3"
                  >
                    <AppText className="text-text-secondary text-xs font-medium">
                      {card.label}
                    </AppText>
                    <AppText className="text-text-primary mt-1 text-sm font-semibold">
                      {card.value}
                    </AppText>
                    <AppText className="text-text-secondary mt-1 text-xs font-medium">
                      {card.meta}
                    </AppText>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardSurface>

        <CardSurface className="justify-between gap-4">
          <div>
            <AppText className="text-text-secondary text-xs font-medium tracking-[0.12em] uppercase">
              Индекс эффективности
            </AppText>
            <AppText className="text-accent-primary mt-2 text-[48px] leading-none font-bold">
              {vehicle.efficiencyIndex}
            </AppText>
            <AppText className="text-text-secondary mt-2 text-sm font-medium">
              {vehicle.efficiencyCaption}
            </AppText>
          </div>

          <div className="bg-background-page rounded-[16px] px-4 py-3">
            <AppText className="text-text-secondary text-xs font-medium">
              Выручка за период
            </AppText>
            <AppText className="text-text-primary mt-1 text-lg font-semibold">
              ₽ {moneyFormatter.format(revenueTotal)}
            </AppText>
            <AppText className="text-text-secondary mt-1 text-xs font-medium">
              За последние 30 дней
            </AppText>
          </div>
        </CardSurface>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {vehicle.kpis.map((card) => (
          <KpiCard
            key={card.label}
            label={card.label}
            value={card.value}
            meta={card.meta}
            className="min-w-0"
            valueClassName="text-text-primary"
            metaClassName="text-accent-primary"
          />
        ))}
      </section>

      <CardSurface className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <AppText
              tag={TAG.h2}
              size={TEXT_SIZES_VARIABLES.default}
              className="text-text-primary font-semibold"
            >
              Динамика выручки
            </AppText>
            <AppText className="text-text-secondary mt-1 text-sm font-medium">
              Доходность автомобиля по дням за последний операционный цикл.
            </AppText>
          </div>

          <DetailChip label="30 дней" className="text-accent-primary" />
        </div>

        <VerticalBarChart
          data={vehicle.revenueSeries}
          valueLabel="₽ / день"
          height={310}
          yTickFormatter={(value) =>
            Intl.NumberFormat("ru-RU", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(value)
          }
          tooltipDateFormatter={(date) => `День ${date}`}
          tooltipValueFormatter={(value) => `₽ ${moneyFormatter.format(value)}`}
        />
      </CardSurface>

      <CardSurface className="gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <AppText
              tag={TAG.h2}
              size={TEXT_SIZES_VARIABLES.default}
              className="text-text-primary font-semibold"
            >
              Аналитика простоев
            </AppText>
            <AppText className="text-text-secondary mt-1 text-sm font-medium">
              Блок оценивает прямое влияние простоев на доходность и доступность
              машины.
            </AppText>
          </div>

          <span
            className={cn(
              "inline-flex h-8 items-center rounded-[10px] px-3 text-xs font-semibold",
              vehicle.downtime.statusTone === "accent"
                ? "bg-dark-primary-soft text-text-primary"
                : "bg-accent-primary-soft text-text-primary",
            )}
          >
            {vehicle.downtime.statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="bg-accent-primary-soft rounded-[18px] px-5 py-4">
            <AppText
              variant={TEXT_VARIANTS_VARIABLES.main}
              className="text-accent-primary text-xs font-medium tracking-[0.12em] uppercase"
            >
              Lost profit
            </AppText>
            <AppText className="text-text-primary mt-2 text-[34px] leading-none font-bold">
              ₽ {moneyFormatter.format(vehicle.downtime.lostProfit)}
            </AppText>
            <AppText className="text-text-secondary mt-2 text-sm font-medium">
              {vehicle.downtime.note}
            </AppText>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="bg-background-page rounded-[16px] px-4 py-3">
              <AppText className="text-text-secondary text-xs font-medium">
                Дней простоя
              </AppText>
              <AppText className="text-text-primary mt-1 text-2xl font-bold">
                {vehicle.downtime.daysDown}
              </AppText>
              <AppText className="text-text-secondary mt-1 text-xs font-medium">
                {vehicle.downtime.averageIdleStreak} дня средний цикл
              </AppText>
            </div>

            <div className="bg-background-page rounded-[16px] px-4 py-3">
              <AppText className="text-text-secondary text-xs font-medium">
                Влияние на выручку
              </AppText>
              <AppText className="text-text-primary mt-1 text-2xl font-bold">
                {vehicle.downtime.revenueImpactPercent}%
              </AppText>
              <AppText className="text-text-secondary mt-1 text-xs font-medium">
                было {vehicle.downtime.previousRevenueImpactPercent}% в прошлом
                окне
              </AppText>
            </div>
          </div>
        </div>
      </CardSurface>
    </main>
  );
};
