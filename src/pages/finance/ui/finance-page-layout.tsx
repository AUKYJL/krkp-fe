import type { ReactNode } from "react";

import { PageHeader } from "@/features/page-header/page-header";

type FinancePageLayoutProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  breadcrumbs: Array<{ label: string; href?: string }>;
};

export const FinancePageLayout = ({
  title,
  description,
  actions,
  children,
  breadcrumbs,
}: FinancePageLayoutProps) => {
  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      {children}
    </main>
  );
};
