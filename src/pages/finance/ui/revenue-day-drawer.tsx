import { PencilLine } from "lucide-react";
import { useEffect, useState } from "react";

import { AppText } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

import { KpiCard } from "@/features/kpi-card";

import type { DrawerMode, DriverRevenueDay } from "../types";
import {
  formatCurrency,
  formatDateLong,
  formatDrawerUpdatedAt,
  getDayStatus,
  sanitizeRevenueInput,
} from "../utils/finance-page.utils";
import { DetailRow } from "./detail-row";
import { RevenueStatusBadge } from "./revenue-status-badge";

type RevenueDayDrawerProps = {
  day?: DriverRevenueDay;
  open: boolean;
  mode: DrawerMode;
  onModeChange: (mode: DrawerMode) => void;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: { revenue: number; comment: string }) => void;
};

export const RevenueDayDrawer = ({
  day,
  open,
  mode,
  onModeChange,
  onOpenChange,
  onSave,
}: RevenueDayDrawerProps) => {
  const [draftRevenue, setDraftRevenue] = useState("");
  const [draftComment, setDraftComment] = useState("");

  useEffect(() => {
    setDraftRevenue(day?.revenue == null ? "" : String(day.revenue));
    setDraftComment(day?.comment ?? "");
  }, [day, mode]);

  const isEditing = mode === "edit";
  const isFilled = day?.revenue != null;
  const isSaveDisabled = sanitizeRevenueInput(draftRevenue).length === 0;

  return (
    <Drawer open={open} direction="right" onOpenChange={onOpenChange}>
      <DrawerContent showCloseButton className="max-h-[calc(100vh-1.5rem)]">
        {day ? (
          <>
            <DrawerHeader>
              <DrawerTitle>{formatDateLong(day.workDate)}</DrawerTitle>
              <DrawerDescription>
                Детализация выручки по рабочему дню
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6 md:px-7 md:pb-7">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <KpiCard
                  label="Выручка"
                  value={
                    isEditing
                      ? draftRevenue.length > 0
                        ? formatCurrency(Number(draftRevenue))
                        : "—"
                      : formatCurrency(day.revenue)
                  }
                  meta={isFilled ? "Данные сохранены" : "Ожидает заполнения"}
                  valueClassName="text-text-primary"
                  metaClassName="text-accent-primary"
                  className="bg-background-page min-w-0 rounded-[18px] shadow-none"
                />
                <KpiCard
                  label="Статус"
                  value={<RevenueStatusBadge status={getDayStatus(day)} />}
                  meta={
                    day.canEdit
                      ? "Редактирование разрешено"
                      : "Редактирование недоступно"
                  }
                  valueClassName="text-text-primary"
                  metaClassName="text-text-secondary"
                  className="bg-background-page min-w-0 rounded-[18px] shadow-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <DetailRow label="Рабочая смена" value={day.shift} />
                <DetailRow label="Автомобиль" value={day.car} />
                <DetailRow
                  label="Последнее изменение"
                  value={formatDrawerUpdatedAt(day.updatedAt)}
                />
              </div>

              {isEditing ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <AppText className="text-text-primary text-sm font-semibold">
                      Выручка за день
                    </AppText>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Введите сумму"
                      value={draftRevenue}
                      className="h-12 tabular-nums"
                      onChange={(event) => {
                        setDraftRevenue(
                          sanitizeRevenueInput(event.target.value),
                        );
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <AppText className="text-text-primary text-sm font-semibold">
                      Комментарий
                    </AppText>
                    <Textarea
                      placeholder="Добавьте комментарий по смене"
                      value={draftComment}
                      className="border-border-default bg-background-page min-h-28 rounded-[14px] px-3 py-3 text-sm font-medium shadow-none"
                      onChange={(event) => {
                        setDraftComment(event.target.value);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <DetailRow
                  label="Комментарий"
                  value={day.comment ?? "Комментарий не указан"}
                  multiline
                />
              )}
            </div>

            <DrawerFooter className="sm:flex-row sm:justify-end">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant={BUTTON_VARIANTS_VARIABLES.secondary}
                    className="sm:min-w-[150px]"
                    onClick={() => {
                      onModeChange("view");
                    }}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="button"
                    className="sm:min-w-[150px]"
                    disabled={isSaveDisabled}
                    onClick={() => {
                      const nextRevenue = Number(
                        sanitizeRevenueInput(draftRevenue),
                      );

                      if (!Number.isFinite(nextRevenue) || nextRevenue <= 0) {
                        return;
                      }

                      onSave({
                        revenue: nextRevenue,
                        comment: draftComment.trim(),
                      });
                      onModeChange("view");
                    }}
                  >
                    Сохранить
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant={BUTTON_VARIANTS_VARIABLES.secondary}
                    onClick={() => onOpenChange(false)}
                  >
                    Закрыть
                  </Button>
                  {day.canEdit ? (
                    <Button type="button" onClick={() => onModeChange("edit")}>
                      <PencilLine className="size-4" />
                      {day.revenue == null ? "Ввести выручку" : "Редактировать"}
                    </Button>
                  ) : null}
                </>
              )}
            </DrawerFooter>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
};
