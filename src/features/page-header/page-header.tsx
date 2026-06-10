import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { clearAuthToken } from "@/shared/api/auth";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { AppText, TAG, TEXT_SIZES_VARIABLES } from "@/ui/app-text";

import { AppBreadcrumbs } from "../app-breadcrumbs";

type BreadcrumbItemType = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemType[];
  actions?: ReactNode;
  showLogoutButton?: boolean;
};

export const PageHeader = ({
  title,
  description,
  breadcrumbs,
  actions,
  showLogoutButton = false,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthToken();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
      <div className="min-w-0 flex-1">
        {breadcrumbs?.length ? <AppBreadcrumbs items={breadcrumbs} /> : null}

        <AppText
          tag={TAG.h1}
          size={TEXT_SIZES_VARIABLES.large}
          className="text-text-primary mt-1 font-bold"
        >
          {title}
        </AppText>

        {description ? (
          <AppText className="text-text-primary/60 mt-1 text-sm font-medium">
            {description}
          </AppText>
        ) : null}
      </div>

      {actions || showLogoutButton ? (
        <div className="flex flex-wrap items-center gap-2 lg:max-w-[52%] lg:justify-end">
          {actions}
          {showLogoutButton ? (
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Выйти
            </Button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
};
