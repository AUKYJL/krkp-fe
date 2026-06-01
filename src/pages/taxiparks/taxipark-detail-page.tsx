import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  CarFront,
  Search,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { AppText, TEXT_SIZES_VARIABLES } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/select";
import { cn } from "@/shared/utils";

import { BestIndicatorItem, StatusBadge } from "./ui";
import { DataTable } from "@/features/data-table";
import { DonutPieChart } from "@/features/donut-pie-chart";
import { PageHeader } from "@/features/page-header/page-header";
import { ProgressCard } from "@/features/progress-card";
import { TitledBlock } from "@/features/titled-block";

const moneyFormatter = new Intl.NumberFormat("ru-RU");
const ALL_VALUE = "all";

type FleetVehicleStatus = "active" | "break" | "risk";

type FleetVehicleRow = {
  id: string;
  vehicle: string;
  plate: string;
  driver: string;
  status: FleetVehicleStatus;
  revenue: number;
  workDays: number;
  efficiency: number;
};

type FleetDriverRow = {
  id: string;
  driver: string;
  vehicle: string;
  revenue: number;
  workDays: number;
  averageRevenue: number;
  rating: number;
};

type FleetWorkDayRow = {
  id: string;
  tripDate: string;
  revenue: number;
  driver: string;
  vehicle: string;
};

type FilterSelectOption = {
  value: string;
  label: string;
};

type SearchFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

type SelectFieldProps = {
  icon: typeof CarFront;
  label: string;
  value: string;
  placeholder: string;
  options: FilterSelectOption[];
  onValueChange: (value: string) => void;
  className?: string;
};

type FleetDetailTableSectionProps<TData> = {
  title: string;
  subtitle: string;
  toolbar: ReactNode;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
};

const vehicleModels = [
  "Kia Rio X",
  "Hyundai Solaris",
  "VW Polo",
  "Skoda Rapid",
  "Lada Vesta",
  "Toyota Camry",
  "Haval Jolion",
];

const vehicleDrivers = [
  "Иван Петров",
  "Алексей Смирнов",
  "Денис Козлов",
  "Олег Иванов",
];

const vehicleRows: FleetVehicleRow[] = Array.from({ length: 42 }).map(
  (_, index) => {
    const vehicle = vehicleModels[index % vehicleModels.length];
    const driver = vehicleDrivers[index % vehicleDrivers.length];
    const plate = [
      "А456МР 799",
      "Е117КС 799",
      "Т904ОМ 799",
      "Р501ХН 799",
      "К774НТ 799",
      "Н284РК 799",
      "Х908АЕ 799",
    ][index % 7];
    const status = (["active", "break", "risk"] as const)[index % 3];
    const revenue = 174_800 + index * 3_200;
    const workDays = 29 + (index % 3);
    const efficiency = 63 + (index % 28);

    return {
      id: String(index + 1).padStart(4, "0"),
      vehicle,
      plate,
      driver,
      status,
      revenue,
      workDays,
      efficiency,
    };
  },
);

const driverRows: FleetDriverRow[] = Array.from({ length: 28 }).map(
  (_, index) => {
    const driver = vehicleDrivers[index % vehicleDrivers.length];
    const vehicle = vehicleModels[index % vehicleModels.length];
    const revenue = 212_400 + index * 2_450;
    const workDays = 29 + (index % 4);
    const averageRevenue = 5_826 + index * 137;
    const rating = Number((4 + (index % 10) * 0.1).toFixed(1));

    return {
      id: String(index + 1).padStart(4, "0"),
      driver,
      vehicle,
      revenue,
      workDays,
      averageRevenue,
      rating,
    };
  },
);

const workDayRows: FleetWorkDayRow[] = Array.from({ length: 12 }).map(
  (_, index) => {
    const day = 28 + index;
    const driver = vehicleDrivers[index % vehicleDrivers.length];
    const vehicle = vehicleModels[index % vehicleModels.length];
    const revenue = 9_850 + index * 1_150;

    return {
      id: String(index + 1).padStart(4, "0"),
      tripDate: `2026-05-${String(day).padStart(2, "0")}`,
      revenue,
      driver,
      vehicle,
    };
  },
);

const revenueByParkData = [
  { label: "Северный парк", value: 46 },
  { label: "Город Такси", value: 25 },
  { label: "Остальные", value: 29 },
];

const bestIndicators = [
  {
    title: "Парк Северный",
    subtitle: "Самый высокий чек",
    value: "₽ 1 940",
  },
  {
    title: "Город Такси",
    subtitle: "Минимальный простой",
    value: "1.8 ч",
  },
  {
    title: "Экспресс",
    subtitle: "Выполнение SLA",
    value: "98%",
  },
];

const rankingRows = [
  { label: "Северный", plan: "118%", status: "Исправен" },
  { label: "Город", plan: "104%", status: "Исправен" },
  { label: "Экспресс", plan: "91%", status: "Исправен" },
];

const fleetVehicleColumns: ColumnDef<FleetVehicleRow>[] = [
  { accessorKey: "vehicle", header: "Автомобиль" },
  { accessorKey: "plate", header: "Номер" },
  { accessorKey: "driver", header: "Водитель" },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ getValue }) => {
      const value = getValue<FleetVehicleStatus>();

      return (
        <span
          className={cn(
            "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold",
            value === "active" && "bg-accent-primary-soft text-text-primary",
            value === "break" && "bg-background-page text-text-primary",
            value === "risk" && "bg-dark-primary-soft text-text-primary",
          )}
        >
          {value === "active" && "На линии"}
          {value === "break" && "Перерыв"}
          {value === "risk" && "Риск"}
        </span>
      );
    },
  },
  {
    accessorKey: "revenue",
    header: "Выручка",
    cell: ({ getValue }) => (
      <span className="text-accent-primary font-bold tabular-nums">
        ₽ {moneyFormatter.format(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "workDays",
    header: "Дней на линии",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "efficiency",
    header: "Эффективность",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue<number>())}%</span>
    ),
  },
];

const fleetDriverColumns: ColumnDef<FleetDriverRow>[] = [
  { accessorKey: "driver", header: "Водитель" },
  { accessorKey: "vehicle", header: "Автомобиль" },
  {
    accessorKey: "revenue",
    header: "Выручка",
    cell: ({ getValue }) => (
      <span className="text-accent-primary font-medium tabular-nums">
        ₽ {moneyFormatter.format(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "workDays",
    header: "Рабочие дни",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "averageRevenue",
    header: "Средняя выручка",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        ₽ {moneyFormatter.format(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "rating",
    header: "Рейтинг",
    cell: ({ getValue }) => (
      <span className="text-accent-primary tabular-nums">
        {String(getValue<number>())}
      </span>
    ),
  },
];

const fleetWorkDayColumns: ColumnDef<FleetWorkDayRow>[] = [
  { accessorKey: "tripDate", header: "Дата поездки" },
  {
    accessorKey: "revenue",
    header: "Выручка",
    cell: ({ getValue }) => (
      <span className="text-accent-primary font-medium tabular-nums">
        ₽ {moneyFormatter.format(getValue<number>())}
      </span>
    ),
  },
  { accessorKey: "driver", header: "Имя водителя" },
  { accessorKey: "vehicle", header: "Автомобиль" },
];

const matchText = (value: string, query: string) =>
  value.toLowerCase().includes(query.toLowerCase());

const SearchField = ({
  label,
  placeholder,
  value,
  onChange,
  className,
}: SearchFieldProps) => {
  return (
    <label
      className={cn(
        "bg-background-page border-border-default flex h-[52px] w-[280px] items-center gap-2 rounded-[10px] border px-3",
        className,
      )}
    >
      <Search className="text-text-primary/70 size-4 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-text-primary/65 text-[11px] font-medium">
          {label}
        </span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="text-text-primary placeholder:text-text-primary/40 w-full bg-transparent text-[13px] font-semibold outline-none"
        />
      </div>
    </label>
  );
};

const SelectField = ({
  icon: Icon,
  label,
  value,
  placeholder,
  options,
  onValueChange,
  className,
}: SelectFieldProps) => {
  const selectedLabel =
    value === ALL_VALUE
      ? placeholder
      : (options.find((option) => option.value === value)?.label ??
        placeholder);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "bg-background-card border-border-default h-[52px] w-[180px] rounded-[10px] px-3",
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="text-text-primary/60 size-4 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
            <span className="text-text-primary/65 text-[11px] font-medium">
              {label}
            </span>
            <span className="text-text-primary truncate text-[13px] font-semibold">
              {selectedLabel}
            </span>
          </div>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const FleetDetailTableSection = <TData,>({
  title,
  subtitle,
  toolbar,
  columns,
  data,
}: FleetDetailTableSectionProps<TData>) => {
  return (
    <TitledBlock
      title={title}
      subtitle={subtitle}
      headerClassName="items-center"
      topRightSlot={toolbar}
      className="min-w-0"
    >
      <DataTable columns={columns} data={data} initialPageSize={10} />
    </TitledBlock>
  );
};

type TaxiparkDetailPageProps = {
  taxiparkId: string;
};

export const TaxiparkDetailPage = ({ taxiparkId }: TaxiparkDetailPageProps) => {
  const navigate = useNavigate();
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleModel, setVehicleModel] = useState(ALL_VALUE);
  const [vehicleDriver, setVehicleDriver] = useState(ALL_VALUE);

  const [driverSearch, setDriverSearch] = useState("");
  const [driverVehicle, setDriverVehicle] = useState(ALL_VALUE);
  const [driverName, setDriverName] = useState(ALL_VALUE);

  const [workDaySearch, setWorkDaySearch] = useState("");
  const [workDayVehicle, setWorkDayVehicle] = useState(ALL_VALUE);
  const [workDayDriver, setWorkDayDriver] = useState(ALL_VALUE);

  const filteredVehicles = vehicleRows.filter((row) => {
    const searchValue = vehicleSearch.trim();
    return (
      (searchValue.length === 0 ||
        [row.vehicle, row.plate, row.driver].some((value) =>
          matchText(value, searchValue),
        )) &&
      (vehicleModel === ALL_VALUE || row.vehicle === vehicleModel) &&
      (vehicleDriver === ALL_VALUE || row.driver === vehicleDriver)
    );
  });

  const filteredDrivers = driverRows.filter((row) => {
    const searchValue = driverSearch.trim();
    return (
      (searchValue.length === 0 ||
        [row.driver, row.vehicle, String(row.rating)].some((value) =>
          matchText(value, searchValue),
        )) &&
      (driverVehicle === ALL_VALUE || row.vehicle === driverVehicle) &&
      (driverName === ALL_VALUE || row.driver === driverName)
    );
  });

  const filteredWorkDays = workDayRows.filter((row) => {
    const searchValue = workDaySearch.trim();
    return (
      (searchValue.length === 0 ||
        [row.tripDate, row.driver, row.vehicle].some((value) =>
          matchText(value, searchValue),
        )) &&
      (workDayVehicle === ALL_VALUE || row.vehicle === workDayVehicle) &&
      (workDayDriver === ALL_VALUE || row.driver === workDayDriver)
    );
  });

  const vehicleOptions = vehicleModels.map((vehicle) => ({
    value: vehicle,
    label: vehicle,
  }));

  const driverOptions = vehicleDrivers.map((driver) => ({
    value: driver,
    label: driver,
  }));

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Москва Центр"
        description={`Финансовая аналитика, автомобили и водители внутри таксопарка. ID: ${taxiparkId}`}
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Таксопарки", href: "/taxiparks" },
          { label: "Москва Центр" },
        ]}
        actions={
          <>
            <Button
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={() => {
                navigate({ to: "/taxiparks" });
              }}
            >
              <ArrowLeft className="size-4" />
              Назад
            </Button>
            <Button>
              <UserRoundCheck className="size-4" />
              Редактировать
            </Button>
            <Button>
              <UserRound className="size-4" />
              Создать
            </Button>
          </>
        }
      />

      <section className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FleetKpi label="Создан" value="12.03.2023" meta="Регион: Москва" />
          <FleetKpi label="Автомобилей" value="186" meta="161 активных" />
          <FleetKpi label="Водителей" value="241" meta="на текущий месяц" />
          <FleetKpi
            label="Общая выручка"
            value="₽ 18 420 000"
            meta="статус: Активен"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FleetKpi label="Общая выручка" value="₽ 18 420 000" meta="+14.8%" />
          <FleetKpi label="Всего автомобилей" value="186" meta="+6" />
          <FleetKpi label="Активные автомобили" value="161" meta="86%" />
          <FleetKpi label="Аварийные автомобили" value="14" meta="7.5%" />
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <FleetKpi
            label="Процент выхода на линию"
            value="88.6%"
            meta="+2.1%"
          />
          <FleetKpi
            label="Потери от простоев"
            value="₽ 942 000"
            meta="критично"
          />
          <FleetKpi
            label="Средняя выручка на водителя"
            value="₽ 76 432"
            meta="формула ниже"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TitledBlock
          title="Распределение выручки"
          subtitle="По паркам за текущий месяц"
          headerClassName="items-center"
          topRightSlot={<StatusBadge label="Исправен" />}
          className="min-w-0"
        >
          <DonutPieChart
            data={revenueByParkData}
            centerLabel="2.8М"
            centerSubLabel="руб."
            size={156}
            innerRadius={62}
            outerRadius={78}
          />
        </TitledBlock>

        <TitledBlock
          title="Автомобили таксопарка"
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
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
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
            {rankingRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1fr_80px_120px] items-center gap-3"
              >
                <AppText className="text-text-primary text-sm font-medium">
                  {row.label}
                </AppText>
                <AppText className="text-text-primary text-sm font-medium tabular-nums">
                  {row.plan}
                </AppText>
                <StatusBadge label={row.status} />
              </div>
            ))}
          </div>
        </TitledBlock>

        <TitledBlock title="Лучшие показатели" className="min-w-0">
          <div className="flex flex-col gap-3">
            {bestIndicators.map((item) => (
              <BestIndicatorItem key={item.title} {...item} />
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
      </section>

      <FleetDetailTableSection
        title="Автомобили"
        subtitle="Автомобили парка, показатели линии и статусы"
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <SearchField
              label="Поиск авто"
              placeholder="Марка, номер, водитель"
              value={vehicleSearch}
              onChange={setVehicleSearch}
            />
            <SelectField
              icon={CarFront}
              label="Автомобиль"
              value={vehicleModel}
              placeholder="Все автомобили"
              options={vehicleOptions}
              onValueChange={setVehicleModel}
              className="w-[180px]"
            />
            <SelectField
              icon={UserRound}
              label="Водитель"
              value={vehicleDriver}
              placeholder="Все водители"
              options={driverOptions}
              onValueChange={setVehicleDriver}
              className="w-[170px]"
            />
          </div>
        }
        columns={fleetVehicleColumns}
        data={filteredVehicles}
      />

      <FleetDetailTableSection
        title="Водители"
        subtitle="Детализация по водителям и их выручке"
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <SearchField
              label="Поиск водителя"
              placeholder="Имя, авто, рейтинг"
              value={driverSearch}
              onChange={setDriverSearch}
            />
            <SelectField
              icon={UserRound}
              label="Водитель"
              value={driverName}
              placeholder="Все водители"
              options={driverOptions}
              onValueChange={setDriverName}
              className="w-[180px]"
            />
            <SelectField
              icon={CarFront}
              label="Автомобиль"
              value={driverVehicle}
              placeholder="Все авто"
              options={vehicleOptions}
              onValueChange={setDriverVehicle}
              className="w-[170px]"
            />
          </div>
        }
        columns={fleetDriverColumns}
        data={filteredDrivers}
      />

      <FleetDetailTableSection
        title="Рабочие дни"
        subtitle="Записи по датам поездок, водителям и выручке"
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <SearchField
              label="Поиск водителя"
              placeholder="Имя, авто, рейтинг"
              value={workDaySearch}
              onChange={setWorkDaySearch}
            />
            <SelectField
              icon={UserRound}
              label="Водитель"
              value={workDayDriver}
              placeholder="Все водители"
              options={driverOptions}
              onValueChange={setWorkDayDriver}
              className="w-[180px]"
            />
            <SelectField
              icon={CarFront}
              label="Автомобиль"
              value={workDayVehicle}
              placeholder="Все авто"
              options={vehicleOptions}
              onValueChange={setWorkDayVehicle}
              className="w-[170px]"
            />
          </div>
        }
        columns={fleetWorkDayColumns}
        data={filteredWorkDays}
      />
    </main>
  );
};

type FleetKpiProps = {
  label: string;
  value: string;
  meta: string;
};

const FleetKpi = ({ label, value, meta }: FleetKpiProps) => {
  return (
    <div className="bg-background-card border-border-default flex min-w-0 flex-col gap-2 rounded-[14px] border p-4 shadow-[0_6px_18px_0_rgba(35,35,35,0.06)]">
      <AppText
        size={TEXT_SIZES_VARIABLES.xs}
        className="text-text-primary/60 font-medium"
      >
        {label}
      </AppText>
      <AppText className="text-text-primary text-[22px] font-bold">
        {value}
      </AppText>
      <AppText
        size={TEXT_SIZES_VARIABLES.xs}
        className="text-accent-primary font-semibold"
      >
        {meta}
      </AppText>
    </div>
  );
};
