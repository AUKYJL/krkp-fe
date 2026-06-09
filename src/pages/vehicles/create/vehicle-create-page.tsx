import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { $api } from "@/shared/api/apiInstance";
import { fetchClient } from "@/shared/api/apiInstance";
import type { components } from "@/shared/api/apiTypes";
import { getApiErrorMessage } from "@/shared/api/auth";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { FieldGroup } from "@/shared/ui/field";
import { FormCombobox, FormInput, FormSelect } from "@/shared/ui/form";
import { Spinner } from "@/shared/ui/spinner";

import { VEHICLE_STATUS_OPTIONS } from "../consts";

import { PageHeader } from "@/features/page-header/page-header";

const VEHICLE_CREATE_STATE_OPTIONS = VEHICLE_STATUS_OPTIONS.map((option) => {
  if (option.value === "ok") {
    return { value: "WORKING", label: option.label };
  }

  if (option.value === "risk") {
    return { value: "EMERGENCY", label: option.label };
  }

  return { value: "REPAIR", label: option.label };
});

const vehicleCreateSchema = z.object({
  taxiParkId: z.string().trim().min(1, "Выберите таксопарк"),
  firm: z.string().trim().min(1, "Укажите марку"),
  model: z.string().trim().min(1, "Укажите модель"),
  type: z.string().trim().min(1, "Укажите тип"),
  plateNumber: z.string().trim().min(1, "Укажите гос номер"),
  state: z.enum(["WORKING", "EMERGENCY", "REPAIR"], {
    error: "Выберите состояние",
  }),
  driverId: z.string().trim().optional().or(z.literal("")),
});

export type VehicleCreateFormValues = z.infer<typeof vehicleCreateSchema>;

type TaxiParkOption = {
  taxiParkId: string;
  taxiParkName: string;
};

type CarOption = {
  carId: string;
  plateNumber: string;
};

type CreateCarDto = components["schemas"]["CreateCarDto"];
type AssignCarDto = components["schemas"]["AssignCarDto"];

const getResponseData = async <T,>(
  request: Promise<{ data?: T; error?: unknown }>,
) => {
  const response = await request;

  if (response.error) {
    throw response.error;
  }

  return response.data;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const extractArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value)) {
    if (Array.isArray(value.items)) {
      return value.items;
    }

    if (Array.isArray(value.data)) {
      return value.data;
    }

    if (Array.isArray(value.rows)) {
      return value.rows;
    }
  }

  return [];
};

const pickString = (value: unknown, keys: string[]) => {
  if (!isRecord(value)) {
    return undefined;
  }

  for (const key of keys) {
    const candidate = value[key];

    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return undefined;
};

const normalizeTaxiParks = (value: unknown): TaxiParkOption[] => {
  return extractArray(value).flatMap((item): TaxiParkOption[] => {
    const taxiParkId = pickString(item, ["taxiParkId", "id"]);
    const taxiParkName = pickString(item, ["name", "taxiParkName"]);

    if (!taxiParkId || !taxiParkName) {
      return [];
    }

    return [
      {
        taxiParkId,
        taxiParkName,
      },
    ];
  });
};

const normalizePlateNumber = (value: string) =>
  value.replace(/\s+/g, "").trim().toUpperCase();

const getTaxiParkCars = async (taxiParkId: string) => {
  const data = await getResponseData(
    fetchClient.GET("/api/taxi-parks/{taxiParkId}/cars", {
      params: { path: { taxiParkId } },
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );

  return extractArray(data)
    .map((item) => {
      const carId =
        pickString(item, ["carId", "id", "car.id", "vehicle.id"]) ?? undefined;
      const plateNumber =
        pickString(item, [
          "plateNumber",
          "car.plateNumber",
          "vehicle.plateNumber",
        ]) ?? undefined;

      if (!carId || !plateNumber) {
        return null;
      }

      return {
        carId,
        plateNumber,
      };
    })
    .filter((item): item is CarOption => item != null);
};

const createVehicle = async ({
  taxiParkId,
  body,
}: {
  taxiParkId: string;
  body: CreateCarDto;
}) => {
  await getResponseData(
    fetchClient.POST("/api/taxi-parks/{taxiParkId}/cars", {
      params: {
        path: { taxiParkId },
      },
      body,
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

const assignCarToDriver = async ({
  driverId,
  carId,
}: {
  driverId: string;
  carId: string;
}) => {
  await getResponseData(
    fetchClient.POST("/api/drivers/{driverId}/assign-car", {
      params: {
        path: { driverId },
      },
      body: {
        carId,
      } satisfies AssignCarDto,
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

export const VehicleCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const taxiParkQuery = $api.useQuery("get", "/api/taxi-parks", undefined, {
    retry: false,
    placeholderData: (previousData) => previousData,
  });
  const taxiParkOptions = normalizeTaxiParks(taxiParkQuery.data);

  const form = useForm<VehicleCreateFormValues>({
    resolver: zodResolver(vehicleCreateSchema),
    defaultValues: {
      taxiParkId: "",
      firm: "",
      model: "",
      type: "",
      plateNumber: "",
      state: undefined,
      driverId: "",
    },
  });

  const {
    control,
    setValue,
    formState: { isSubmitting },
    handleSubmit,
  } = form;
  const selectedTaxiParkId = useWatch({
    control,
    name: "taxiParkId",
  });
  const previousTaxiParkId = useRef("");

  useEffect(() => {
    if (
      previousTaxiParkId.current &&
      selectedTaxiParkId !== previousTaxiParkId.current
    ) {
      setValue("driverId", "");
    }
    previousTaxiParkId.current = selectedTaxiParkId;
  }, [selectedTaxiParkId, setValue]);

  const driversQuery = $api.useQuery(
    "get",
    "/api/taxi-parks/{taxiParkId}/drivers",
    {
      params: {
        path: {
          taxiParkId: selectedTaxiParkId,
        },
      },
    },
    {
      enabled: selectedTaxiParkId.length > 0,
      retry: false,
      placeholderData: (previousData) => previousData,
    },
  );

  const drivers = (driversQuery.data ?? []).map((driver) => ({
    driverId: driver.driverId,
    label: driver.fullName,
  }));

  const handleFormSubmit = async (values: VehicleCreateFormValues) => {
    await createVehicle({
      taxiParkId: values.taxiParkId,
      body: {
        firm: values.firm,
        model: values.model,
        type: values.type,
        plateNumber: values.plateNumber,
        state: values.state,
      },
    });

    const cars = await getTaxiParkCars(values.taxiParkId);
    const createdCar = cars.find(
      (car) =>
        normalizePlateNumber(car.plateNumber) ===
        normalizePlateNumber(values.plateNumber),
    );

    if (!createdCar) {
      throw new Error("Не удалось найти созданный автомобиль по госномеру.");
    }

    if (values.driverId) {
      await assignCarToDriver({
        driverId: values.driverId,
        carId: createdCar.carId,
      });
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
      queryClient.invalidateQueries({ queryKey: ["drivers"] }),
      queryClient.invalidateQueries({
        queryKey: ["home", "director-dashboard"],
      }),
      queryClient.invalidateQueries({ queryKey: ["vehicles", "create"] }),
    ]);

    navigate({ to: "/vehicles" });
  };

  if (taxiParkQuery.isLoading) {
    return (
      <main className="bg-background-page flex min-h-full w-full items-center justify-center p-6">
        <Spinner className="min-h-40" />
      </main>
    );
  }

  if (taxiParkQuery.error || !taxiParkQuery.data) {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title="Создание автомобиля"
          description="Не удалось загрузить доступные таксопарки."
          breadcrumbs={[
            { label: "Главная", href: "/" },
            { label: "Автомобили", href: "/vehicles" },
            { label: "Создание" },
          ]}
          actions={
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              asChild
            >
              <Link to="/vehicles">
                <ArrowLeft className="size-4" />К списку
              </Link>
            </Button>
          }
        />

        <CardSurface className="gap-3 p-5">
          <div className="text-text-primary text-sm font-semibold">
            Не удалось загрузить таксопарк
          </div>
          <div className="text-text-secondary text-sm">
            {getApiErrorMessage(taxiParkQuery.error)}
          </div>
        </CardSurface>
      </main>
    );
  }

  const selectedTaxiPark = taxiParkOptions.find(
    (taxiPark) => taxiPark.taxiParkId === selectedTaxiParkId,
  );

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Создание автомобиля"
        description="Добавьте автомобиль в нужный таксопарк и при необходимости сразу назначьте свободного водителя."
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Автомобили", href: "/vehicles" },
          { label: "Создание" },
        ]}
        actions={
          <Button
            type="button"
            variant={BUTTON_VARIANTS_VARIABLES.secondary}
            asChild
          >
            <Link to="/vehicles">
              <ArrowLeft className="size-4" />К списку
            </Link>
          </Button>
        }
      />

      <CardSurface className="gap-6 p-5">
        <form
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <FormSelect
              control={control}
              name="state"
              label="Состояние"
              placeholder="Выберите состояние"
              options={VEHICLE_CREATE_STATE_OPTIONS}
            />

            <FormCombobox
              control={control}
              name="taxiParkId"
              label="Таксопарк"
              placeholder="Выберите таксопарк"
              options={taxiParkOptions.map((taxiPark) => ({
                value: taxiPark.taxiParkId,
                label: taxiPark.taxiParkName,
              }))}
              searchPlaceholder="Поиск таксопарка..."
              emptyText="Таксопарки не найдены"
            />

            <FormInput
              control={control}
              name="firm"
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
              name="type"
              label="Тип"
              id="vehicle-type"
              placeholder="Например, SEDAN"
            />

            <FormInput
              control={control}
              name="plateNumber"
              label="Гос номер"
              id="vehicle-plate"
              placeholder="Например, А123ВС 77"
            />

            <FormCombobox
              control={control}
              name="driverId"
              label="Назначить водителя"
              placeholder={
                !selectedTaxiParkId
                  ? "Сначала выберите таксопарк"
                  : driversQuery.isLoading
                    ? "Загружаем свободных водителей"
                    : "Без назначения"
              }
              options={[
                { value: "", label: "Без назначения" },
                ...drivers.map((driver) => ({
                  value: driver.driverId,
                  label: driver.label,
                })),
              ]}
              disabled={
                !selectedTaxiParkId ||
                driversQuery.isLoading ||
                driversQuery.error != null
              }
              searchPlaceholder="Поиск водителя..."
              emptyText="Свободных водителей нет"
            />
          </FieldGroup>

          {!selectedTaxiParkId ? (
            <div className="text-text-secondary text-sm">
              Сначала выберите таксопарк, после этого загрузятся свободные
              водители.
            </div>
          ) : null}

          {driversQuery.error ? (
            <div className="text-text-secondary text-sm">
              {getApiErrorMessage(driversQuery.error)}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              <Check className="size-4" />
              Создать автомобиль
            </Button>

            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={() => navigate({ to: "/vehicles" })}
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
