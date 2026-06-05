import type { ReactNode } from "react";

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
};

export const PageHeader = ({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) => {
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

      {actions ? (
        <div className="flex flex-wrap items-center gap-2 lg:max-w-[52%] lg:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
};
