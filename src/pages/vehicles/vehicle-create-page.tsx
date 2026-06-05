import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { driverMockData } from "@/pages/drivers/consts";
import { tableMockData } from "@/pages/taxiparks/consts";
import {
  VEHICLE_STATUS_OPTIONS,
  VEHICLE_STATUS_VALUES,
} from "@/pages/vehicles/consts";

import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { type ComboboxOption } from "@/shared/ui/combobox";
import { FieldGroup } from "@/shared/ui/field";
import { FormCombobox, FormInput, FormSelect } from "@/shared/ui/form";

import { PageHeader } from "@/features/page-header/page-header";

const vehicleCreateSchema = z.object({
  brand: z.string().trim().min(1, "Укажите марку"),
  model: z.string().trim().min(1, "Укажите модель"),
  plate: z.string().trim().min(1, "Укажите гос номер"),
  status: z.enum(VEHICLE_STATUS_VALUES, {
    error: "Выберите состояние",
  }),
  taxiparkId: z.string().optional(),
  driverId: z.string().optional(),
});

export type VehicleCreateFormValues = z.infer<typeof vehicleCreateSchema>;

const taxiparkOptions: ComboboxOption[] = tableMockData.map((taxipark) => ({
  value: taxipark.id,
  label: taxipark.name,
  keywords: [taxipark.status],
}));

const normalizeAssignedCar = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const freeDriverOptions: ComboboxOption[] = driverMockData
  .filter((driver) => normalizeAssignedCar(driver.car).length === 0)
  .map((driver) => ({
    value: driver.id,
    label: driver.driver,
    keywords: [driver.status],
  }));

const buildVehicleCreatePayload = (values: VehicleCreateFormValues) => {
  return {
    ...values,
    taxiparkName: taxiparkOptions.find(
      (taxipark) => taxipark.value === values.taxiparkId,
    )?.label,
    driverName: freeDriverOptions.find(
      (driver) => driver.value === values.driverId,
    )?.label,
  };
};

export const VehicleCreatePage = () => {
  const navigate = useNavigate();
  const form = useForm<VehicleCreateFormValues>({
    resolver: zodResolver(vehicleCreateSchema),
    defaultValues: {
      brand: "",
      model: "",
      plate: "",
      status: undefined,
      taxiparkId: "",
      driverId: "",
    },
  });

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  const handleFormSubmit = (values: VehicleCreateFormValues) => {
    void buildVehicleCreatePayload(values);

    navigate({ to: "/vehicles" });
  };

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Создание автомобиля"
        description="Добавьте автомобиль в локальный UI-каталог и при необходимости сразу назначьте парк и водителя."
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
              name="plate"
              label="Гос номер"
              id="vehicle-plate"
              placeholder="Например, А123ВС 77"
            />

            <FormSelect
              control={control}
              name="status"
              label="Состояние"
              placeholder="Выберите состояние"
              options={VEHICLE_STATUS_OPTIONS}
            />

            <FormCombobox
              control={control}
              name="taxiparkId"
              label="Назначить таксопарк"
              options={taxiparkOptions}
              placeholder="Выберите таксопарк"
              searchPlaceholder="Поиск таксопарка"
              emptyText="Таксопарки не найдены"
            />

            <FormCombobox
              control={control}
              name="driverId"
              label="Назначить водителя"
              options={freeDriverOptions}
              placeholder="Выберите водителя"
              searchPlaceholder="Поиск водителя"
              emptyText="Свободных водителей нет"
            />
          </FieldGroup>

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
