import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "@/features/page-header/page-header";
import { getApiErrorMessage } from "@/shared/api/auth";
import { fetchClient } from "@/shared/api/apiInstance";
import type { components } from "@/shared/api/apiTypes";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { FieldGroup } from "@/shared/ui/field";
import { FormInput } from "@/shared/ui/form";
import { Spinner } from "@/shared/ui/spinner";

const taxiparkFormSchema = z.object({
  name: z.string().trim().min(1, "Укажите название таксопарка"),
  address: z.string().trim().min(1, "Укажите адрес"),
});

type TaxiparkFormValues = z.infer<typeof taxiparkFormSchema>;
type CreateTaxiParkDto = components["schemas"]["CreateTaxiParkDto"];
type UpdateTaxiParkDto = components["schemas"]["UpdateTaxiParkDto"];
type TaxiparkFormMode = "create" | "edit";

type TaxiparkResponse = {
  id: string;
  name: string;
  address: string;
};

type TaxiparkFormPageProps =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      taxiparkId: string;
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
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

const normalizeTaxiPark = (
  taxiparkId: string,
  value: unknown,
): TaxiparkResponse | null => {
  const name = pickString(value, ["name", "title", "taxiParkName"]);
  const address = pickString(value, ["address", "location", "taxiParkAddress"]);

  if (!name || !address) {
    return null;
  }

  return {
    id: pickString(value, ["id", "taxiParkId"]) ?? taxiparkId,
    name,
    address,
  };
};

const getTaxipark = async (taxiparkId: string) => {
  const data = await getResponseData(
    fetchClient.GET("/api/taxi-parks/{id}", {
      params: {
        path: { id: taxiparkId },
      },
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );

  return normalizeTaxiPark(taxiparkId, data);
};

const createTaxipark = async (body: CreateTaxiParkDto) => {
  await getResponseData(
    fetchClient.POST("/api/taxi-parks", {
      body,
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

const updateTaxipark = async ({
  taxiparkId,
  body,
}: {
  taxiparkId: string;
  body: UpdateTaxiParkDto;
}) => {
  await getResponseData(
    fetchClient.PATCH("/api/taxi-parks/{id}", {
      params: {
        path: { id: taxiparkId },
      },
      body,
    }) as Promise<{ data?: unknown; error?: unknown }>,
  );
};

const getPageCopy = (mode: TaxiparkFormMode) => {
  if (mode === "create") {
    return {
      title: "Создание таксопарка",
      description: "Добавьте новый таксопарк и заполните его базовые данные.",
      breadcrumbLabel: "Создание",
      submitLabel: "Создать таксопарк",
    };
  }

  return {
    title: "Редактирование таксопарка",
    description: "Обновите название и адрес таксопарка.",
    breadcrumbLabel: "Редактирование",
    submitLabel: "Сохранить изменения",
  };
};

export const TaxiparkFormPage = (props: TaxiparkFormPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pageCopy = getPageCopy(props.mode);
  const taxiparkQuery = useQuery({
    queryKey:
      props.mode === "edit"
        ? ["taxiparks", "form", props.taxiparkId]
        : ["taxiparks", "form", "create"],
    queryFn: () => {
      if (props.mode !== "edit") {
        return Promise.resolve(null);
      }

      return getTaxipark(props.taxiparkId);
    },
    enabled: props.mode === "edit",
    retry: false,
  });

  const form = useForm<TaxiparkFormValues>({
    resolver: zodResolver(taxiparkFormSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = form;

  useEffect(() => {
    if (props.mode !== "edit" || !taxiparkQuery.data) {
      return;
    }

    reset({
      name: taxiparkQuery.data.name,
      address: taxiparkQuery.data.address,
    });
  }, [props.mode, reset, taxiparkQuery.data]);

  const handleFormSubmit = async (values: TaxiparkFormValues) => {
    if (props.mode === "create") {
      await createTaxipark(values);
    } else {
      await updateTaxipark({
        taxiparkId: props.taxiparkId,
        body: values,
      });
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["taxiparks"] }),
      queryClient.invalidateQueries({ queryKey: ["drivers"] }),
      queryClient.invalidateQueries({ queryKey: ["home"] }),
    ]);

    if (props.mode === "edit") {
      navigate({ to: "/taxiparks/$id", params: { id: props.taxiparkId } });
      return;
    }

    navigate({ to: "/taxiparks" });
  };

  if (props.mode === "edit" && taxiparkQuery.isLoading) {
    return (
      <main className="bg-background-page flex min-h-full w-full items-center justify-center p-6">
        <Spinner className="min-h-40" />
      </main>
    );
  }

  if (props.mode === "edit" && (taxiparkQuery.error || !taxiparkQuery.data)) {
    return (
      <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
        <PageHeader
          title={pageCopy.title}
          description="Не удалось загрузить данные таксопарка."
          breadcrumbs={[
            { label: "Главная", href: "/" },
            { label: "Таксопарки", href: "/taxiparks" },
            { label: pageCopy.breadcrumbLabel },
          ]}
          actions={
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              asChild
            >
              <Link to="/taxiparks/$id" params={{ id: props.taxiparkId }}>
                <ArrowLeft className="size-4" />К карточке
              </Link>
            </Button>
          }
        />

        <CardSurface className="gap-3 p-5">
          <div className="text-text-primary text-sm font-semibold">
            Не удалось загрузить таксопарк
          </div>
          <div className="text-text-secondary text-sm">
            {getApiErrorMessage(taxiparkQuery.error)}
          </div>
        </CardSurface>
      </main>
    );
  }

  return (
    <main className="bg-background-page flex min-h-full w-full flex-col gap-6 p-6">
      <PageHeader
        title={pageCopy.title}
        description={pageCopy.description}
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Таксопарки", href: "/taxiparks" },
          ...(props.mode === "edit" && taxiparkQuery.data
            ? [
                {
                  label: taxiparkQuery.data.name,
                  href: `/taxiparks/${props.taxiparkId}`,
                },
              ]
            : []),
          { label: pageCopy.breadcrumbLabel },
        ]}
        actions={
          <Button
            type="button"
            variant={BUTTON_VARIANTS_VARIABLES.secondary}
            asChild
          >
            {props.mode === "edit" ? (
              <Link to="/taxiparks/$id" params={{ id: props.taxiparkId }}>
                <ArrowLeft className="size-4" />К карточке
              </Link>
            ) : (
              <Link to="/taxiparks">
                <ArrowLeft className="size-4" />К списку
              </Link>
            )}
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
              name="name"
              label="Название"
              id="taxipark-name"
              placeholder="Например, Таксопарк №1"
            />

            <FormInput
              control={control}
              name="address"
              label="Адрес"
              id="taxipark-address"
              placeholder="Например, Москва, ул. Пушкина 1"
            />
          </FieldGroup>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              <Check className="size-4" />
              {pageCopy.submitLabel}
            </Button>

            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              onClick={() => {
                if (props.mode === "edit") {
                  navigate({
                    to: "/taxiparks/$id",
                    params: { id: props.taxiparkId },
                  });
                  return;
                }

                navigate({ to: "/taxiparks" });
              }}
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
