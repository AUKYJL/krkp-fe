import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CardSurface } from "@/shared/ui/card-surface";

import { driverMockData } from "../consts";
import { DriverCard } from "./ui/driver-card";
import { PageHeader } from "@/features/page-header/page-header";
import { type PageSizeOption, Pagination } from "@/features/pagination";
import { SearchInput } from "@/features/search-input";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";

const DEFAULT_PAGE_SIZE: PageSizeOption = 10;

export const DriverAddPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);

  const query = search.trim().toLowerCase();
  const filteredDrivers =
    query.length === 0
      ? driverMockData
      : driverMockData.filter((driver) =>
          driver.driver.toLowerCase().includes(query),
        );

  const pageCount = Math.ceil(filteredDrivers.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedDrivers = filteredDrivers.slice(
    startIndex,
    startIndex + pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  useEffect(() => {
    if (pageCount === 0 && page !== 1) {
      setPage(1);
      return;
    }

    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Добавить водителя"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          {
            label: TAXIPARKS_SIDEBAR_NAV_BY_ID.drivers.label,
            href: "/drivers",
          },
          { label: "Добавить водителя" },
        ]}
      />

      <CardSurface className="gap-6 p-5">
        <SearchInput
          value={search}
          onChange={(value) => setSearch(value)}
          placeholder="Поиск водителя"
          className="w-full sm:max-w-sm"
        />

        {paginatedDrivers.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {paginatedDrivers.map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                onClick={() =>
                  navigate({
                    to: "/drivers/$id",
                    params: { id: driver.id },
                    search: { mode: "external" },
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="border-dark-primary/10 bg-background-page flex min-h-52 items-center justify-center rounded-[18px] border border-dashed px-6 text-center">
            <p className="text-text-primary/60 text-sm font-medium">
              По вашему запросу водители не найдены.
            </p>
          </div>
        )}

        <Pagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          canPrevious={page > 1}
          canNext={page < pageCount}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </CardSurface>
    </main>
  );
};
