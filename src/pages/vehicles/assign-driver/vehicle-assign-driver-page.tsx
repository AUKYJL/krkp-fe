import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "@/features/page-header/page-header";
import { fetchClient } from "@/shared/api/apiInstance";
import { getApiErrorMessage } from "@/shared/api/auth";
import type { components } from "@/shared/api/apiTypes";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { FieldGroup } from "@/shared/ui/field";
import { FormCombobox } from "@/shared/ui/form";
import { Spinner } from "@/shared/ui/spinner";

const NONE_DRIVER_VALUE = "__none__";

const assignDriverSchema = z.object({
  driverId: z.string().trim().min(1, "Выберите водителя"),
});

type AssignDriverFormValues = z.infer<typeof assignDriverSchema>;
type TaxiParkDriver = {
  driverId: string;
  fullName: string;
};

type VehicleAssignDriverCar = {
  carId?: string;
  id?: string;
  firm?: string;
  model?: string;
  plateNumber?: string;
  taxiParkId?: string;
  assignedDriver?:
    | {
        driverId?: string;
        id?: string;
        fullName?: string;
      }
    | null;
};

const getResponseData = async <T,>(
  request: Promise<{ data?: T; error?: unknown }>,
) => {
  const response = await request;

  if (response.error) {
    throw response.error;
  }

  return response.data;
};

const isNotFoundError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    (error as { statusCode?: unknown }).statusCode === 404
  );
};

const getAssignedDriverId = (
  assignedDriver: VehicleAssignDriverCar["assignedDriver"],
) => {
  if (!assignedDriver) {
    return NONE_DRIVER_VALUE;
  }

  return assignedDriver.driverId ?? assignedDriver.id ?? NONE_DRIVER_VALUE;
};

const assignCarDriver = async ({
  carId,
  driverId,
}: {
  carId: string;
  driverId: string | null;
}) => {
  await getResponseData(
    fetchClient.POST("/api/cars/{carId}/assign-driver", {
      params: {
        path: { carId },
      },
      body: {
        driverId,
      } as components["schemas"]["AssignDriverDto"],
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

type VehicleAssignDriverPageProps = {
  carId: string;
};

export const VehicleAssignDriverPage = ({
  carId,
}: VehicleAssignDriverPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const carQuery = useQuery({
    queryKey: ["vehicles", "assign-driver", carId],
    queryFn: async () => {
      const response = await getResponseData(
        fetchClient.GET("/api/cars/{id}", {
          params: {
            path: { id: carId },
          },
        }),
      );

      return response as unknown as VehicleAssignDriverCar;
    },
    retry: false,
  });

  const taxiParkId = carQuery.data?.taxiParkId;

  const driversQuery = useQuery({
    queryKey: ["drivers", taxiParkId, "assign-driver"],
    queryFn: async () => {
      const response = await getResponseData(
        fetchClient.GET("/api/taxi-parks/{taxiParkId}/drivers", {
          params: {
            path: {
              taxiParkId: taxiParkId ?? "",
            },
          },
        }),
      );

      return (response ?? []) as TaxiParkDriver[];
    },
    enabled: Boolean(taxiParkId),
    retry: false,
    placeholderData: (previousData) => previousData,
  });

  const currentAssignedDriverId = getAssignedDriverId(
    carQuery.data?.assignedDriver,
  );

  const driverOptions = [
    { value: NONE_DRIVER_VALUE, label: "Без водителя" },
    ...(driversQuery.data ?? []).map((driver) => ({
      value: driver.driverId,
      label: driver.fullName,
    })),
  ];

  const form = useForm<AssignDriverFormValues>({
    resolver: zodResolver(assignDriverSchema),
    defaultValues: {
      driverId: currentAssignedDriverId,
    },
    values: {
      driverId: currentAssignedDriverId,
    },
  });

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  const handleFormSubmit = async (values: AssignDriverFormValues) => {
    await assignCarDriver({
      carId,
      driverId: values.driverId === NONE_DRIVER_VALUE ? null : values.driverId,
    });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
      queryClient.invalidateQueries({ queryKey: ["drivers"] }),
    ]);

    navigate({ to: "/vehicles/$id", params: { id: carId } });
  };

  const vehicleTitle = carQuery.data
    ? `${carQuery.data.firm ?? "Автомобиль"} ${carQuery.data.model ?? ""}`.trim()
    : "Автомобиль";
  const vehiclePlateNumber = carQuery.data?.plateNumber;
  const currentDriverLabel =
    carQuery.data?.assignedDriver?.fullName ?? "Не назначен";

  if (carQuery.isLoading) {
    return (
      <main className="bg-background-page flex min-h-full w-full items-center justify-center p-6">
        <Spinner className="min-h-40" />
      </main>
    );
  }

  if (carQuery.isError) {
    const isCarNotFound = isNotFoundError(carQuery.error);

    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Назначение водителя"
          description="Выберите водителя таксопарка для автомобиля."
          breadcrumbs={[
            { label: "Главная", href: "/" },
            { label: "Автомобили", href: "/vehicles" },
            { label: carId },
            { label: "Назначение водителя" },
          ]}
          actions={
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              asChild
            >
              <Link to="/vehicles/$id" params={{ id: carId }}>
                <ArrowLeft className="size-4" />
                К карточке
              </Link>
            </Button>
          }
        />

        <CardSurface className="gap-3 p-5">
          <div className="text-text-primary text-sm font-semibold">
            {isCarNotFound ? "Автомобиль не найден" : "Не удалось загрузить автомобиль"}
          </div>
          <div className="text-text-secondary text-sm">
            {isCarNotFound
              ? "Указанный автомобиль не найден."
              : getApiErrorMessage(carQuery.error)}
          </div>
        </CardSurface>
      </main>
    );
  }

  if (!carQuery.data) {
    return null;
  }

  if (driversQuery.isLoading) {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Назначение водителя"
          description={`Выберите водителя таксопарка для ${vehicleTitle}.`}
          breadcrumbs={[
            { label: "Главная", href: "/" },
            { label: "Автомобили", href: "/vehicles" },
            { label: vehicleTitle, href: `/vehicles/${carId}` },
            { label: "Назначение водителя" },
          ]}
          actions={
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              asChild
            >
              <Link to="/vehicles/$id" params={{ id: carId }}>
                <ArrowLeft className="size-4" />
                К карточке
              </Link>
            </Button>
          }
        />

        <CardSurface className="gap-3 p-5">
          <div className="flex items-center gap-3">
            <Spinner className="min-h-8" />
            <div className="text-text-secondary text-sm">
              Загружаем список водителей
            </div>
          </div>
        </CardSurface>
      </main>
    );
  }

  if (driversQuery.isError) {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Назначение водителя"
          description={`Выберите водителя таксопарка для ${vehicleTitle}.`}
          breadcrumbs={[
            { label: "Главная", href: "/" },
            { label: "Автомобили", href: "/vehicles" },
            { label: vehicleTitle, href: `/vehicles/${carId}` },
            { label: "Назначение водителя" },
          ]}
          actions={
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              asChild
            >
              <Link to="/vehicles/$id" params={{ id: carId }}>
                <ArrowLeft className="size-4" />
                К карточке
              </Link>
            </Button>
          }
        />

        <CardSurface className="gap-3 p-5">
          <div className="text-text-primary text-sm font-semibold">
            Не удалось загрузить список водителей
          </div>
          <div className="text-text-secondary text-sm">
            {getApiErrorMessage(driversQuery.error)}
          </div>
        </CardSurface>
      </main>
    );
  }

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Назначение водителя"
        description={`Выберите водителя таксопарка для ${vehicleTitle}.`}
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Автомобили", href: "/vehicles" },
          { label: vehicleTitle, href: `/vehicles/${carId}` },
          { label: "Назначение водителя" },
        ]}
        actions={
          <Button
            type="button"
            variant={BUTTON_VARIANTS_VARIABLES.secondary}
            asChild
          >
            <Link to="/vehicles/$id" params={{ id: carId }}>
              <ArrowLeft className="size-4" />
              К карточке
            </Link>
          </Button>
        }
      />

      <CardSurface className="gap-6 p-5">
        <div className="flex flex-col gap-1">
          <div className="text-text-primary text-sm font-semibold">
            {vehicleTitle}
          </div>
          <div className="text-text-secondary text-sm">
            {vehiclePlateNumber ? `${vehiclePlateNumber} · ` : ""}
            Текущий водитель: {currentDriverLabel}
          </div>
        </div>

        {(driversQuery.data?.length ?? 0) === 0 ? (
          <div className="bg-background-page rounded-[12px] px-4 py-3 text-sm text-text-secondary">
            В этом таксопарке нет доступных водителей. Можно только снять текущего водителя.
          </div>
        ) : null}

        <form
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <FormCombobox
              control={control}
              name="driverId"
              label="Водитель"
              options={driverOptions}
              placeholder="Выберите водителя или Без водителя"
              searchPlaceholder="Поиск водителя"
              emptyText="Водители не найдены"
            />
          </FieldGroup>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              <Check className="size-4" />
              Сохранить
            </Button>
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={() => navigate({ to: "/vehicles/$id", params: { id: carId } })}
            >
              <ArrowLeft className="size-4" />
              Отмена
            </Button>
          </div>
        </form>
      </CardSurface>
    </main>
  );
};
