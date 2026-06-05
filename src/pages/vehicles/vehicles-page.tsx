import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { clearAuthToken, useCurrentUserQuery } from "@/shared/api/auth";
import { ROLES } from "@/shared/types";
import { Spinner } from "@/shared/ui/spinner";
import { can } from "@/shared/utils";

import { DriverVehiclesPage } from "./ui/driver-vehicles-page";
import { DirectorVehiclesPage } from "./ui/director-vehicles-page";

export const VehiclesPage = () => {
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

  if (can(currentUser.role, [ROLES.DIRECTOR])) {
    return <DirectorVehiclesPage />;
  }

  return <DriverVehiclesPage currentUser={currentUser} />;
};
