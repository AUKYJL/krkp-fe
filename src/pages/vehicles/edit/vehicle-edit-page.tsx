import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "@/features/page-header/page-header";
import { fetchClient } from "@/shared/api/apiInstance";
import { getApiErrorMessage } from "@/shared/api/auth";
import type { components } from "@/shared/api/apiTypes";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { FieldGroup } from "@/shared/ui/field";
import { FormCombobox, FormInput, FormSelect } from "@/shared/ui/form";
import { Spinner } from "@/shared/ui/spinner";

const NONE_DRIVER_VALUE = "__none__";

const VEHICLE_EDIT_STATE_OPTIONS: Array<{
  value: "WORKING" | "EMERGENCY" | "REPAIR";
  label: string;
}> = [
  { value: "WORKING", label: "На линии" },
  { value: "EMERGENCY", label: "Авария" },
  { value: "REPAIR", label: "Ремонт" },
];

const vehicleEditSchema = z.object({
  brand: z.string().trim().min(1, "Укажите марку"),
  model: z.string().trim().min(1, "Укажите модель"),
  plateNumber: z.string().trim().min(1, "Укажите гос номер"),
  state: z.enum(["WORKING", "EMERGENCY", "REPAIR"], {
    error: "Выберите состояние",
  }),
  driverId: z.string().trim().min(1, "Выберите водителя"),
});

type VehicleEditFormValues = z.infer<typeof vehicleEditSchema>;
type UpdateCarDto = components["schemas"]["UpdateCarDto"];
type UpdateCarStateDto = components["schemas"]["UpdateCarStateDto"];
type AssignDriverDto = components["schemas"]["AssignDriverDto"];
type TaxiParkDriver = {
  driverId: string;
  fullName: string;
};
type VehicleEditCar = {
  id?: string;
  carId?: string;
  firm?: string;
  model?: string;
  plateNumber?: string;
  state?: "WORKING" | "EMERGENCY" | "REPAIR";
  taxiParkId?: string;
  assignedDriver?:
    | {
        id?: string;
        driverId?: string;
        fullName?: string;
      }
    | null;
};

interface VehicleEditPageProps {
  vehicleId: string;
}

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

const getAssignedDriverId = (assignedDriver: VehicleEditCar["assignedDriver"]) =>
  assignedDriver?.driverId ?? assignedDriver?.id ?? NONE_DRIVER_VALUE;

const updateVehicle = async ({
  vehicleId,
  body,
}: {
  vehicleId: string;
  body: UpdateCarDto;
}) => {
  await getResponseData(
    fetchClient.PATCH("/api/cars/{id}", {
      params: {
        path: { id: vehicleId },
      },
      body,
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

const updateVehicleState = async ({
  vehicleId,
  body,
}: {
  vehicleId: string;
  body: UpdateCarStateDto;
}) => {
  await getResponseData(
    fetchClient.PATCH("/api/cars/{id}/state", {
      params: {
        path: { id: vehicleId },
      },
      body,
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

const assignVehicleDriver = async ({
  vehicleId,
  driverId,
}: {
  vehicleId: string;
  driverId: string | null;
}) => {
  await getResponseData(
    fetchClient.POST("/api/cars/{carId}/assign-driver", {
      params: {
        path: { carId: vehicleId },
      },
      body: {
        driverId,
      } as AssignDriverDto,
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

export const VehicleEditPage = ({ vehicleId }: VehicleEditPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const vehicleQuery = useQuery({
    queryKey: ["vehicles", "edit", vehicleId],
    queryFn: async () => {
      const response = await getResponseData(
        fetchClient.GET("/api/cars/{id}", {
          params: {
            path: { id: vehicleId },
          },
        }),
      );

      return response as unknown as VehicleEditCar;
    },
    retry: false,
  });

  const taxiParkId = vehicleQuery.data?.taxiParkId;
  const driversQuery = useQuery({
    queryKey: ["drivers", taxiParkId, "vehicle-edit"],
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

  const form = useForm<VehicleEditFormValues>({
    resolver: zodResolver(vehicleEditSchema),
    defaultValues: {
      brand: "",
      model: "",
      plateNumber: "",
      state: undefined,
      driverId: NONE_DRIVER_VALUE,
    },
  });

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = form;

  useEffect(() => {
    if (!vehicleQuery.data) {
      return;
    }

    reset({
      brand: vehicleQuery.data.firm ?? "",
      model: vehicleQuery.data.model ?? "",
      plateNumber: vehicleQuery.data.plateNumber ?? "",
      state: vehicleQuery.data.state ?? "WORKING",
      driverId: getAssignedDriverId(vehicleQuery.data.assignedDriver),
    });
  }, [reset, vehicleQuery.data]);

  const handleNavigateToDetail = () => {
    navigate({ to: "/vehicles/$id", params: { id: vehicleId } });
  };

  const handleFormSubmit = async (values: VehicleEditFormValues) => {
    if (!vehicleQuery.data) {
      return;
    }

    const currentDriverId = getAssignedDriverId(vehicleQuery.data.assignedDriver);
    const nextDriverId =
      values.driverId === NONE_DRIVER_VALUE ? null : values.driverId;

    await updateVehicle({
      vehicleId,
      body: {
        firm: values.brand,
        model: values.model,
        plateNumber: values.plateNumber,
      },
    });

    await updateVehicleState({
      vehicleId,
      body: {
        state: values.state,
      },
    });

    if (values.driverId !== currentDriverId) {
      await assignVehicleDriver({
        vehicleId,
        driverId: nextDriverId,
      });
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
      queryClient.invalidateQueries({ queryKey: ["drivers"] }),
    ]);

    navigate({ to: "/vehicles/$id", params: { id: vehicleId } });
  };

  const vehicleTitle = vehicleQuery.data
    ? `${vehicleQuery.data.firm ?? "Автомобиль"} ${vehicleQuery.data.model ?? ""}`.trim()
    : "Автомобиль";
  const vehiclePlateNumber = vehicleQuery.data?.plateNumber ?? vehicleId;

  const driverOptions = [
    { value: NONE_DRIVER_VALUE, label: "Без водителя" },
    ...(driversQuery.data ?? []).map((driver) => ({
      value: driver.driverId,
      label: driver.fullName,
    })),
  ];

  if (vehicleQuery.isLoading) {
    return (
      <main className="bg-background-page flex min-h-full w-full items-center justify-center p-6">
        <Spinner className="min-h-40" />
      </main>
    );
  }

  if (vehicleQuery.isError) {
    const isVehicleNotFound = isNotFoundError(vehicleQuery.error);

    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Редактирование автомобиля"
          description="Обновите основные данные автомобиля, его состояние и назначенного водителя."
          breadcrumbs={[
            { label: "Главная", href: "/" },
            { label: "Автомобили", href: "/vehicles" },
            { label: vehicleId },
            { label: "Редактирование" },
          ]}
          actions={
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              asChild
            >
              <Link to="/vehicles/$id" params={{ id: vehicleId }}>
                <ArrowLeft className="size-4" />
                К карточке
              </Link>
            </Button>
          }
        />

        <CardSurface className="gap-3 p-5">
          <div className="text-text-primary text-sm font-semibold">
            {isVehicleNotFound
              ? "Автомобиль не найден"
              : "Не удалось загрузить автомобиль"}
          </div>
          <div className="text-text-secondary text-sm">
            {isVehicleNotFound
              ? "Указанный автомобиль не найден."
              : getApiErrorMessage(vehicleQuery.error)}
          </div>
        </CardSurface>
      </main>
    );
  }

  if (!vehicleQuery.data) {
    return null;
  }

  if (driversQuery.isLoading) {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Редактирование автомобиля"
          description={`Загружаем водителей таксопарка для ${vehicleTitle}.`}
          breadcrumbs={[
            { label: "Главная", href: "/" },
            { label: "Автомобили", href: "/vehicles" },
            { label: vehiclePlateNumber, href: `/vehicles/${vehicleId}` },
            { label: "Редактирование" },
          ]}
          actions={
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              asChild
            >
              <Link to="/vehicles/$id" params={{ id: vehicleId }}>
                <ArrowLeft className="size-4" />
                К карточке
              </Link>
            </Button>
          }
        />

        <CardSurface className="items-center justify-center p-8">
          <Spinner className="min-h-32" />
        </CardSurface>
      </main>
    );
  }

  if (driversQuery.isError) {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Редактирование автомобиля"
          description="Обновите основные данные автомобиля, его состояние и назначенного водителя."
          breadcrumbs={[
            { label: "Главная", href: "/" },
            { label: "Автомобили", href: "/vehicles" },
            { label: vehiclePlateNumber, href: `/vehicles/${vehicleId}` },
            { label: "Редактирование" },
          ]}
          actions={
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              asChild
            >
              <Link to="/vehicles/$id" params={{ id: vehicleId }}>
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
        title="Редактирование автомобиля"
        description="Обновите основные данные автомобиля, его состояние и назначенного водителя."
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Автомобили", href: "/vehicles" },
          { label: vehiclePlateNumber, href: `/vehicles/${vehicleId}` },
          { label: "Редактирование" },
        ]}
        actions={
          <Button
            type="button"
            variant={BUTTON_VARIANTS_VARIABLES.secondary}
            asChild
          >
            <Link to="/vehicles/$id" params={{ id: vehicleId }}>
              <ArrowLeft className="size-4" />
              К карточке
            </Link>
          </Button>
        }
      />

      <CardSurface className="gap-6 p-5">
        <form
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-3"
        >
          <FieldGroup>
            <FormInput
              control={control}
              name="brand"
              label="Марка"
              id="vehicle-brand"
              placeholder="Например, Kia"
            />

            <FormInput
              control={control}
              name="model"
              label="Модель"
              id="vehicle-model"
              placeholder="Например, Rio"
            />

            <FormInput
              control={control}
              name="plateNumber"
              label="Гос номер"
              id="vehicle-plate"
              placeholder="Например, А123ВС 77"
            />

            <FormSelect
              control={control}
              name="state"
              label="Состояние"
              placeholder="Выберите состояние"
              options={VEHICLE_EDIT_STATE_OPTIONS}
            />

            <FormCombobox
              control={control}
              name="driverId"
              label="Назначить водителя"
              options={driverOptions}
              placeholder="Выберите водителя"
              searchPlaceholder="Поиск водителя"
              emptyText="Водители не найдены"
            />
          </FieldGroup>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              <Check className="size-4" />
              Сохранить изменения
            </Button>

            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={handleNavigateToDetail}
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
