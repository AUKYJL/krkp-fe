import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/features/page-header/page-header";
import { type PageSizeOption, Pagination } from "@/features/pagination";
import { SearchInput } from "@/features/search-input";
import { TAXIPARKS_SIDEBAR_NAV_BY_ID } from "@/features/taxiparks-sidebar";
import {
  type DriverSearchFilter,
  type DriverSearchItem,
  useDriverSearchPageData,
} from "@/pages/drivers/model";
import { AppText, TAG, TEXT_SIZES_VARIABLES } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";

import { DriverCard } from "./ui/driver-card";

const DEFAULT_PAGE_SIZE: PageSizeOption = 10;

const DRIVER_FILTER_OPTIONS: Array<{
  label: string;
  value: DriverSearchFilter;
}> = [
  { label: "Все", value: "all" },
  { label: "В таксопарке", value: "in_park" },
  { label: "Не в таксопарке", value: "not_in_park" },
];

type InviteFeedback = {
  message: string;
  tone: "success" | "error";
};

const DriverSearchErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<unknown>;
}) => {
  return (
    <div className="border-dark-primary/10 bg-background-page flex min-h-52 flex-col items-center justify-center gap-4 rounded-[18px] border border-dashed px-6 text-center">
      <div className="bg-dark-primary-soft text-text-primary flex size-12 items-center justify-center rounded-full">
        <AlertCircle className="size-6" />
      </div>
      <div className="flex max-w-[420px] flex-col gap-2">
        <AppText
          tag={TAG.h2}
          size={TEXT_SIZES_VARIABLES.medium}
          className="text-text-primary font-semibold"
        >
          Не удалось загрузить водителей
        </AppText>
        <AppText className="text-text-secondary text-sm font-medium">
          {message}
        </AppText>
      </div>
      <Button
        type="button"
        variant={BUTTON_VARIANTS_VARIABLES.secondary}
        onClick={() => {
          void onRetry();
        }}
      >
        Повторить
      </Button>
    </div>
  );
};

const EmptyState = ({ query }: { query: string }) => {
  return (
    <div className="border-dark-primary/10 bg-background-page flex min-h-52 items-center justify-center rounded-[18px] border border-dashed px-6 text-center">
      <p className="text-text-primary/60 text-sm font-medium">
        {query.trim().length > 0
          ? "По вашему запросу водители не найдены."
          : "Список водителей пуст."}
      </p>
    </div>
  );
};

export const DriverAddPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [membershipFilter, setMembershipFilter] =
    useState<DriverSearchFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [selectedDriver, setSelectedDriver] = useState<DriverSearchItem | null>(
    null,
  );
  const [selectedTaxiParkId, setSelectedTaxiParkId] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [feedbackByDriverId, setFeedbackByDriverId] = useState<
    Record<string, InviteFeedback | undefined>
  >({});

  const {
    drivers,
    driversError,
    driversErrorMessage,
    isDriversLoading,
    isDriversFetching,
    refetchDrivers,
    taxiParks,
    taxiParksError,
    taxiParksErrorMessage,
    isTaxiParksLoading,
    refetchTaxiParks,
    inviteDriver,
    isInvitePending,
    pendingInviteDriverId,
  } = useDriverSearchPageData({
    search,
    filter: membershipFilter,
  });

  const pageCount = Math.ceil(drivers.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedDrivers = drivers.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, membershipFilter, pageSize]);

  useEffect(() => {
    if (pageCount === 0 && page !== 1) {
      setPage(1);
      return;
    }

    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    if (!selectedDriver || taxiParks.length === 0) {
      return;
    }

    const selectedExists = taxiParks.some(
      (taxiPark) => taxiPark.taxiParkId === selectedTaxiParkId,
    );

    if (!selectedExists) {
      setSelectedTaxiParkId(taxiParks[0]?.taxiParkId ?? "");
    }
  }, [selectedDriver, selectedTaxiParkId, taxiParks]);

  const closeDialog = () => {
    setSelectedDriver(null);
    setSelectedTaxiParkId("");
    setDialogError(null);
  };

  const handleInviteClick = (driver: DriverSearchItem) => {
    setSelectedDriver(driver);
    setSelectedTaxiParkId(taxiParks[0]?.taxiParkId ?? "");
    setDialogError(null);
  };

  const handleInviteConfirm = async () => {
    if (!selectedDriver || !selectedTaxiParkId) {
      return;
    }

    setDialogError(null);
    setFeedbackByDriverId((current) => ({
      ...current,
      [selectedDriver.driverId]: undefined,
    }));

    try {
      await inviteDriver({
        taxiParkId: selectedTaxiParkId,
        driverId: selectedDriver.driverId,
      });

      setFeedbackByDriverId((current) => ({
        ...current,
        [selectedDriver.driverId]: {
          tone: "success",
          message: "Приглашение отправлено.",
        },
      }));
      closeDialog();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Не удалось отправить приглашение. Попробуйте еще раз.";

      setDialogError(message);
      setFeedbackByDriverId((current) => ({
        ...current,
        [selectedDriver.driverId]: {
          tone: "error",
          message,
        },
      }));
    }
  };

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Добавить водителя"
        description="Глобальный поиск водителей с быстрым приглашением в один из ваших таксопарков."
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
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <SearchInput
            value={search}
            onChange={(value) => setSearch(value)}
            placeholder="Поиск по ФИО"
            className="w-full xl:max-w-md"
          />

          <div className="flex flex-wrap gap-2">
            {DRIVER_FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={
                  membershipFilter === option.value
                    ? BUTTON_VARIANTS_VARIABLES.tertiary
                    : BUTTON_VARIANTS_VARIABLES.secondary
                }
                className="rounded-[12px]"
                onClick={() => setMembershipFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {isDriversLoading ? (
          <div className="flex min-h-52 items-center justify-center">
            <Spinner className="min-h-0" />
          </div>
        ) : driversError ? (
          <DriverSearchErrorState
            message={driversErrorMessage}
            onRetry={refetchDrivers}
          />
        ) : paginatedDrivers.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {paginatedDrivers.map((driver) => (
              <DriverCard
                key={driver.driverId}
                driver={driver}
                invitePending={
                  isInvitePending && pendingInviteDriverId === driver.driverId
                }
                feedback={feedbackByDriverId[driver.driverId]}
                onClick={() =>
                  navigate({
                    to: "/drivers/$id",
                    params: { id: driver.driverId },
                    search: { mode: "external" },
                  })
                }
                onInvite={() => handleInviteClick(driver)}
              />
            ))}
          </div>
        ) : (
          <EmptyState query={search} />
        )}

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <AppText className="text-text-secondary text-sm font-medium">
            Найдено: {drivers.length}
            {isDriversFetching && !isDriversLoading ? " · обновляем..." : ""}
          </AppText>

          <Pagination
            page={page}
            pageCount={pageCount}
            pageSize={pageSize}
            canPrevious={page > 1}
            canNext={page < pageCount}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </CardSurface>

      <Dialog open={selectedDriver != null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="rounded-[24px] border-border-default bg-background-card p-6 sm:max-w-[560px]">
          <DialogHeader className="text-left">
            <DialogTitle className="text-text-primary text-xl font-semibold">
              Пригласить водителя
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-sm font-medium">
              {selectedDriver
                ? `Выберите таксопарк для приглашения водителя ${selectedDriver.fullName}.`
                : "Выберите таксопарк для отправки приглашения."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="bg-background-page rounded-[16px] p-4">
              <AppText className="text-text-primary text-base font-semibold">
                {selectedDriver?.fullName ?? "Водитель не выбран"}
              </AppText>
              <AppText className="text-text-secondary mt-1 text-sm font-medium">
                {selectedDriver?.email ?? "—"}
              </AppText>
            </div>

            {isTaxiParksLoading ? (
              <div className="flex min-h-24 items-center justify-center">
                <Spinner className="min-h-0" />
              </div>
            ) : taxiParksError ? (
              <CardSurface className="gap-3 rounded-[20px] border border-status-error/20 bg-status-error/5 p-4 shadow-none">
                <AppText className="text-status-error text-sm font-semibold">
                  Не удалось загрузить список таксопарков
                </AppText>
                <AppText className="text-text-secondary text-sm font-medium">
                  {taxiParksErrorMessage}
                </AppText>
                <div>
                  <Button
                    type="button"
                    variant={BUTTON_VARIANTS_VARIABLES.secondary}
                    onClick={() => {
                      void refetchTaxiParks();
                    }}
                  >
                    Повторить
                  </Button>
                </div>
              </CardSurface>
            ) : (
              <div className="flex flex-col gap-2">
                <AppText className="text-text-primary text-sm font-semibold">
                  Таксопарк
                </AppText>
                <Select
                  value={selectedTaxiParkId}
                  onValueChange={setSelectedTaxiParkId}
                >
                  <SelectTrigger className="h-11 rounded-[14px]">
                    <SelectValue placeholder="Выберите таксопарк" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxiParks.map((taxiPark) => (
                      <SelectItem
                        key={taxiPark.taxiParkId}
                        value={taxiPark.taxiParkId}
                      >
                        {taxiPark.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {dialogError ? (
              <CardSurface className="gap-2 rounded-[20px] border border-status-error/20 bg-status-error/5 p-4 shadow-none">
                <AppText className="text-status-error text-sm font-semibold">
                  Не удалось отправить приглашение
                </AppText>
                <AppText className="text-text-secondary text-sm font-medium">
                  {dialogError}
                </AppText>
              </CardSurface>
            ) : null}
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={closeDialog}
            >
              Отмена
            </Button>
            <Button
              type="button"
              disabled={
                isInvitePending ||
                isTaxiParksLoading ||
                taxiParks.length === 0 ||
                selectedTaxiParkId.length === 0
              }
              onClick={() => {
                void handleInviteConfirm();
              }}
            >
              {isInvitePending ? "Отправляем..." : "Отправить приглашение"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};
