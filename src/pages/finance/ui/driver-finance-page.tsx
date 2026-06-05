import { useDriverFinance } from "../hooks";
import { formatEditTime } from "../utils/finance-page.utils";

import { DriverFinanceAnalytics } from "./driver-finance-analytics";
import { DriverFinanceTable } from "./driver-finance-table";
import { FinancePageLayout } from "./finance-page-layout";
import { FinancePeriodFilter } from "./finance-period-filter";
import { RevenueDayDrawer } from "./revenue-day-drawer";
import { DriverTodayRevenueCard } from "@/features/driver-today-revenue-card";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";

type DriverFinancePageProps = {
  fullName: string;
};

export const DriverFinancePage = ({ fullName }: DriverFinancePageProps) => {
  const {
    chartData,
    closeDrawer,
    customRange,
    drawerMode,
    filteredDays,
    handleCustomRangeChange,
    handlePeriodChange,
    isDrawerOpen,
    kpiCards,
    openDay,
    period,
    saveSelectedDay,
    selectedDay,
    setDrawerMode,
    tableDays,
  } = useDriverFinance({ fullName });

  return (
    <FinancePageLayout
      title="Выручка"
      description="История, аналитика и детализация выручки по рабочим дням"
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.finance.label },
      ]}
      actions={
        <FinancePeriodFilter
          period={period}
          customRange={customRange}
          onPeriodChange={handlePeriodChange}
          onCustomRangeChange={handleCustomRangeChange}
        />
      }
    >
      <DriverFinanceAnalytics
        filteredDaysCount={filteredDays.length}
        kpiCards={kpiCards}
        chartData={chartData}
        table={<DriverFinanceTable data={tableDays} onOpenDay={openDay} />}
      />

      <RevenueDayDrawer
        day={selectedDay}
        open={isDrawerOpen}
        mode={drawerMode}
        onModeChange={setDrawerMode}
        onOpenChange={closeDrawer}
        onSave={saveSelectedDay}
      />
    </FinancePageLayout>
  );
};
