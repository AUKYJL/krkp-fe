import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { clearAuthToken, useCurrentUserQuery } from "@/shared/api/auth";
import { ROLES } from "@/shared/types/auth";
import { Spinner } from "@/shared/ui/spinner";
import { can } from "@/shared/utils";

import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";

import { DriverFinancePage, EmptyStateCard } from "./ui";
import { FinancePageLayout } from "./ui/finance-page-layout";

export const FinancePage = () => {
  const navigate = useNavigate();
  const { data: currentUser, error, isLoading } = useCurrentUserQuery();

  useEffect(() => {
    if (!error) {
      return;
    }

    clearAuthToken();
    void navigate({ to: "/auth/login", replace: true });
  }, [error, navigate]);

  if (isLoading) {
    return (
      <main className="bg-background-page flex min-h-full w-full items-center justify-center p-6">
        <Spinner className="min-h-40" />
      </main>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (!can(currentUser.role, [ROLES.DRIVER])) {
    return (
      <FinancePageLayout
        title="Выручка"
        description="Раздел истории и аналитики выручки для роли водителя"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: TAXIPARKS_SIDEBAR_NAV_BY_ID.finance.label },
        ]}
      >
        <EmptyStateCard message="Страница выручки для роли директора в текущей итерации не реализована." />
      </FinancePageLayout>
    );
  }

  return <DriverFinancePage fullName={currentUser.fullName} />;
};
