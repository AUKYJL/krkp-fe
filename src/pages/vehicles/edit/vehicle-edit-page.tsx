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
} from "../consts";

import { PageHeader } from "@/features/page-header/page-header";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { type ComboboxOption } from "@/shared/ui/combobox";
import { FieldGroup } from "@/shared/ui/field";
import { FormCombobox, FormInput, FormSelect } from "@/shared/ui/form";

const vehicleEditSchema = z.object({
  brand: z.string().trim().min(1, "Укажите марку"),
  model: z.string().trim().min(1, "Укажите модель"),
  plate: z.string().trim().min(1, "Укажите гос номер"),
  status: z.enum(VEHICLE_STATUS_VALUES, {
    error: "Выберите состояние",
  }),
  taxiparkId: z.string().optional(),
  driverId: z.string().optional(),
});

type VehicleEditFormValues = z.infer<typeof vehicleEditSchema>;

interface VehicleEditPageProps {
  vehiclePlate: string;
}

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

const buildVehicleEditPayload = (values: VehicleEditFormValues) => {
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

export const VehicleEditPage = ({
  vehiclePlate,
}: VehicleEditPageProps) => {
  const navigate = useNavigate();
  const form = useForm<VehicleEditFormValues>({
    resolver: zodResolver(vehicleEditSchema),
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

  const handleNavigateToDetail = () => {
    navigate({ to: "/vehicles/$id", params: { id: vehiclePlate } });
  };

  const handleFormSubmit = (values: VehicleEditFormValues) => {
    void buildVehicleEditPayload(values);

    handleNavigateToDetail();
  };

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Редактирование автомобиля"
        description="Обновите данные автомобиля в локальном UI-сценарии и при необходимости переназначьте парк или водителя."
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Автомобили", href: "/vehicles" },
          { label: vehiclePlate, href: `/vehicles/${vehiclePlate}` },
          { label: "Редактирование" },
        ]}
        actions={
          <Button
            type="button"
            variant={BUTTON_VARIANTS_VARIABLES.secondary}
            asChild
          >
            <Link to="/vehicles/$id" params={{ id: vehiclePlate }}>
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
