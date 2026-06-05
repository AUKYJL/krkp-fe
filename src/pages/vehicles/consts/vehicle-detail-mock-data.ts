import type {
  VehicleDetailKpi,
  VehicleDetailRecord,
  VehicleDetailRevenuePoint,
  VehicleDetailSummaryCard,
  VehicleRow,
} from "./types";
import { vehicleTableData } from "./vehicle-table-data";

const moneyFormatter = new Intl.NumberFormat("ru-RU");
const numberFormatter = new Intl.NumberFormat("ru-RU");

type VehicleDetailSeed = {
  description: string;
  updatedAt: string;
  photoLabel: string;
  efficiencyCaption: string;
  revenueOffset: number;
  downtimeNote: string;
  driverPhone: string;
  tariff: string;
  mileageKm: number;
};

const VEHICLE_DETAIL_SEEDS: Record<string, VehicleDetailSeed> = {
  A124BC: {
    description:
      "Линейный автомобиль комфорт-класса, закреплен за утренней сменой.",
    updatedAt: "сегодня 09:20",
    photoLabel: "Kia Rio",
    efficiencyCaption: "Лучше среднего по парку",
    revenueOffset: 350,
    downtimeNote: "Плановое ТО в следующем цикле через 6 дней.",
    driverPhone: "+7 (916) 102-44-19",
    tariff: "Комфорт",
    mileageKm: 118_400,
  },
  B777OP: {
    description:
      "Автомобиль в аварийной зоне по простою и выручке второй недели подряд.",
    updatedAt: "сегодня 08:45",
    photoLabel: "Hyundai",
    efficiencyCaption: "Ниже плана на этой неделе",
    revenueOffset: -620,
    downtimeNote: "Есть риск продления ремонта из-за ожидания запчастей.",
    driverPhone: "+7 (926) 508-91-07",
    tariff: "Эконом+",
    mileageKm: 173_200,
  },
  E909TT: {
    description:
      "Машина снята с линии и ожидает закрепления за новым водителем.",
    updatedAt: "вчера 19:10",
    photoLabel: "VW Polo",
    efficiencyCaption: "Нужна повторная активация",
    revenueOffset: -1_100,
    downtimeNote: "Потери носят структурный характер: машина не закреплена.",
    driverPhone: "Водитель не назначен",
    tariff: "Эконом",
    mileageKm: 146_900,
  },
};

const getSeed = (plate: string): VehicleDetailSeed => {
  if (VEHICLE_DETAIL_SEEDS[plate]) {
    return VEHICLE_DETAIL_SEEDS[plate];
  }

  const rowIndex = vehicleTableData.findIndex((row) => row.plate === plate);

  return {
    description:
      "Автомобиль работает в штатном цикле и используется в базовом потоке заказов.",
    updatedAt: "сегодня 09:10",
    photoLabel: plate,
    efficiencyCaption:
      rowIndex % 3 === 0
        ? "Стабильно держит план"
        : "Ровный операционный профиль",
    revenueOffset: (rowIndex % 5) * 180 - 240,
    downtimeNote:
      "Сильных отклонений по ремонту или документам не зафиксировано.",
    driverPhone: `+7 (9${10 + rowIndex}) ${String(420 + rowIndex * 11).padStart(3, "0")}-${String(10 + rowIndex).padStart(2, "0")}-${String(30 + rowIndex).padStart(2, "0")}`,
    tariff: rowIndex % 2 === 0 ? "Комфорт" : "Эконом+",
    mileageKm: 110_000 + rowIndex * 7_300,
  };
};

const formatMoney = (value: number) =>
  `₽ ${moneyFormatter.format(Math.round(value))}`;

const formatCompactMoney = (value: number) => {
  if (value >= 1_000_000) {
    return `₽ ${(value / 1_000_000).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `₽ ${Math.round(value / 1_000)}k`;
  }

  return `₽ ${moneyFormatter.format(value)}`;
};

const buildRevenueSeries = (
  row: VehicleRow,
  revenueOffset: number,
): VehicleDetailRevenuePoint[] =>
  Array.from({ length: 30 }).map((_, index) => {
    const day = index + 1;
    const weekdayWave = [0, 160, 420, 690, 860, 320, -410][index % 7];
    const trend = index * 34;
    const dip = index === 8 || index === 19 ? -1_050 : 0;
    const spike = index === 13 || index === 26 ? 1_280 : 0;
    const value = Math.max(
      0,
      Math.round(
        row.averageDayRevenue * 0.82 +
          weekdayWave +
          trend +
          revenueOffset +
          dip +
          spike,
      ),
    );

    return {
      date: String(day).padStart(2, "0"),
      value,
    };
  });

const buildSummaryCards = (
  row: VehicleRow,
  seed: VehicleDetailSeed,
): VehicleDetailSummaryCard[] => [
  {
    label: "Водитель",
    value: row.driver,
    meta: seed.driverPhone,
  },
  {
    label: "Таксопарк",
    value: row.park,
    meta: `${seed.tariff} тариф`,
  },
  {
    label: "Выручка / день",
    value: formatMoney(row.averageDayRevenue),
    meta: `${row.workdays} рабочих дней`,
  },
  {
    label: "Пробег",
    value: `${numberFormatter.format(seed.mileageKm)} км`,
    meta: `${row.downtimeDays} дней простоя`,
  },
];

const buildKpis = (
  row: VehicleRow,
  revenueSeries: VehicleDetailRevenuePoint[],
): VehicleDetailKpi[] => {
  const monthRevenue = revenueSeries.reduce(
    (total, point) => total + point.value,
    0,
  );
  const activeDays = 30 - row.downtimeDays;
  const utilization = Math.max(
    0,
    Math.min(100, Math.round((activeDays / 30) * 100)),
  );
  const downtimeLoss = Math.round(
    row.averageDayRevenue * row.downtimeDays * 0.92,
  );
  const runRate = activeDays === 0 ? 0 : Math.round(monthRevenue / activeDays);
  const diagnostics = Math.max(1, Math.round(row.downtimeDays / 2));
  const avgIdleStreak = Math.max(
    1,
    Math.round(row.downtimeDays / Math.max(1, diagnostics)),
  );

  return [
    {
      label: "Выручка за 30 дней",
      value: formatCompactMoney(monthRevenue),
      meta: `${Math.round(monthRevenue / 30_000)}k в среднем за 3 дня`,
    },
    {
      label: "Дни на линии",
      value: `${activeDays}`,
      meta: `${utilization}% календаря`,
    },
    {
      label: "Потери от простоя",
      value: formatCompactMoney(downtimeLoss),
      meta: `${row.downtimeDays} дней вне линии`,
    },
    {
      label: "Run rate",
      value: formatMoney(runRate),
      meta: "на активный день",
    },
    {
      label: "Коэффициент загрузки",
      value: `${Math.max(18, row.efficiencyIndex - 6)}%`,
      meta: "по заказам и сменам",
    },
    {
      label: "Диагностики",
      value: `${diagnostics}`,
      meta: `${avgIdleStreak} дня средний цикл`,
    },
    {
      label: "Индекс простоя",
      value: `${row.downtimePercent}%`,
      meta: row.downtimePercent > 25 ? "выше допуска" : "в пределах коридора",
    },
    {
      label: "Эффективность",
      value: `${row.efficiencyIndex}`,
      meta: row.efficiencyIndex >= 85 ? "устойчивый профиль" : "нужен контроль",
    },
  ];
};

const buildVehicleDetailRecord = (row: VehicleRow): VehicleDetailRecord => {
  const seed = getSeed(row.plate);
  const revenueSeries = buildRevenueSeries(row, seed.revenueOffset);
  const lostProfit = Math.round(
    row.averageDayRevenue * row.downtimeDays * 0.88,
  );
  const impactPercent = Math.min(100, Math.max(6, row.downtimePercent + 5));

  return {
    plate: row.plate,
    title: `${row.brand} ${row.plate}`,
    description: seed.description,
    updatedAt: seed.updatedAt,
    photoLabel: seed.photoLabel,
    efficiencyIndex: row.efficiencyIndex,
    efficiencyCaption: seed.efficiencyCaption,
    summaryCards: buildSummaryCards(row, seed),
    kpis: buildKpis(row, revenueSeries),
    revenueSeries,
    downtime: {
      statusLabel: row.status === "ok" ? "Под контролем" : "Нужен разбор",
      statusTone: row.status === "ok" ? "default" : "accent",
      lostProfit,
      daysDown: row.downtimeDays,
      averageIdleStreak: Math.max(1, Math.round(row.downtimeDays / 2)),
      revenueImpactPercent: impactPercent,
      previousRevenueImpactPercent: Math.max(0, impactPercent - 4),
      note: seed.downtimeNote,
    },
  };
};

export const vehicleDetailMockData: VehicleDetailRecord[] =
  vehicleTableData.map(buildVehicleDetailRecord);

export const getVehicleDetailMockByPlate = (plate: string) =>
  vehicleDetailMockData.find((vehicle) => vehicle.plate === plate);
