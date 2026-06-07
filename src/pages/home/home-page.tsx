import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { clearAuthToken, useCurrentUserQuery } from "@/shared/api/auth";
import { Spinner } from "@/shared/ui/spinner";
import { ROLES } from "@/shared/types";
import { can } from "@/shared/utils";

import { useHomeAnalyticsPeriod } from "./model";
import { DirectorHomeDashboard } from "./ui/director-home-dashboard";
import { DriverHomeDashboard } from "./ui/driver-home-dashboard";

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: currentUser, error, isLoading } = useCurrentUserQuery();
  const { range, period, onRangeChange } = useHomeAnalyticsPeriod();

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

  if (can(currentUser.role, [ROLES.DIRECTOR])) {
    return (
      <DirectorHomeDashboard
        currentUser={currentUser}
        range={range}
        period={period}
        onRangeChange={onRangeChange}
      />
    );
  }

  return (
    <DriverHomeDashboard
      currentUser={currentUser}
      range={range}
      period={period}
      onRangeChange={onRangeChange}
    />
  );
};
