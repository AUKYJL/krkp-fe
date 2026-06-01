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
    <header className="flex items-start justify-between gap-6">
      <div className="min-w-0">
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
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
};
