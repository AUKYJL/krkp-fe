import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "@/features/page-header/page-header";
import { getDriverMockById } from "../consts";
import { vehicleTableData } from "@/pages/vehicles/consts/vehicle-table-data";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { type ComboboxOption } from "@/shared/ui/combobox";
import { FieldGroup } from "@/shared/ui/field";
import { FormCombobox } from "@/shared/ui/form";

const driverEditSchema = z.object({
  car: z.string().trim().min(1, "Выберите автомобиль"),
});

type DriverEditFormValues = z.infer<typeof driverEditSchema>;

export interface DriverEditPageProps {
  driverId: string;
}

const buildCarOptionLabel = (brand: string, plate: string) => `${brand} · ${plate}`;

const buildDriverCarOptions = (currentCar: string): ComboboxOption[] => {
  const normalizedCurrentCar = currentCar.trim();
  const freeVehicleOptions = vehicleTableData
    .filter((vehicle) => vehicle.status === "unassigned")
    .map((vehicle) => ({
      value: vehicle.plate,
      label: buildCarOptionLabel(vehicle.brand, vehicle.plate),
      keywords: [vehicle.brand, vehicle.plate, vehicle.park],
    }));

  const hasCurrentCar = freeVehicleOptions.some(
    (option) => option.value === normalizedCurrentCar,
  );

  if (!normalizedCurrentCar || hasCurrentCar) {
    return freeVehicleOptions;
  }

  return [
    {
      value: normalizedCurrentCar,
      label: `Текущий автомобиль · ${normalizedCurrentCar}`,
      keywords: [normalizedCurrentCar, "текущий автомобиль"],
    },
    ...freeVehicleOptions,
  ];
};

export const DriverEditPage = ({ driverId }: DriverEditPageProps) => {
  const navigate = useNavigate();
  const driver = getDriverMockById(driverId);
  const carOptions = buildDriverCarOptions(driver.car);
  const form = useForm<DriverEditFormValues>({
    resolver: zodResolver(driverEditSchema),
    defaultValues: {
      car: driver.car,
    },
  });

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  const handleNavigateToDetail = () => {
    navigate({ to: "/drivers/$id", params: { id: driverId } });
  };

  const handleFormSubmit = () => {
    handleNavigateToDetail();
  };

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title="Редактирование водителя"
        description="Обновите назначенный автомобиль в локальном UI-сценарии без сохранения в mock-данные."
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Водители", href: "/drivers" },
          { label: driver.driver || driverId, href: `/drivers/${driverId}` },
          { label: "Редактирование" },
        ]}
        actions={
          <Button
            type="button"
            variant={BUTTON_VARIANTS_VARIABLES.secondary}
            asChild
          >
            <Link to="/drivers/$id" params={{ id: driverId }}>
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
            <FormCombobox
              control={control}
              name="car"
              label="Автомобиль"
              options={carOptions}
              placeholder="Выберите автомобиль"
              searchPlaceholder="Поиск автомобиля"
              emptyText="Свободные автомобили не найдены"
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
