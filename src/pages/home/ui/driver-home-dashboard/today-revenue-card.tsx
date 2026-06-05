import { useEffect, useRef, useState } from "react";

import { AppText, TAG, TEXT_SIZES_VARIABLES } from "@/shared/ui/app-text";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/utils";

import {
  formatEditTime,
  sanitizeRevenueInput,
} from "./driver-home-dashboard.utils";

const moneyFormatter = new Intl.NumberFormat("ru-RU");

type TodayRevenueCardProps = {
  initialRevenue?: number;
  initialUpdatedAt?: string;
  canEdit: boolean;
};

export const TodayRevenueCard = ({
  initialRevenue,
  initialUpdatedAt,
  canEdit,
}: TodayRevenueCardProps) => {
  const [revenue, setRevenue] = useState<number | undefined>(initialRevenue);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(initialUpdatedAt);
  const [draftValue, setDraftValue] = useState(
    initialRevenue == null ? "" : String(initialRevenue),
  );
  const [isEditing, setIsEditing] = useState(initialRevenue == null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length,
      );
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isEditing]);

  const startEditing = () => {
    if (!canEdit) {
      return;
    }

    setDraftValue(revenue == null ? "" : String(revenue));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraftValue(revenue == null ? "" : String(revenue));
    setIsEditing(false);
  };

  const handleSave = () => {
    const normalizedValue = sanitizeRevenueInput(draftValue);

    if (normalizedValue.length === 0) {
      return;
    }

    setRevenue(Number(normalizedValue));
    setLastUpdatedAt(formatEditTime(new Date()));
    setDraftValue(normalizedValue);
    setIsEditing(false);
  };

  const isSaveDisabled = sanitizeRevenueInput(draftValue).length === 0;

  return (
    <CardSurface className="w-[350px] gap-2 rounded-[24px] p-6 md:p-7">
      <div className="flex flex-col gap-1">
        <AppText
          tag={TAG.h3}
          size={TEXT_SIZES_VARIABLES.medium}
          className="text-text-primary font-bold"
        >
          Выручка сегодня в ₽
        </AppText>
      </div>

      <div className="relative min-h-[138px]">
        <div
          className={cn(
            "flex flex-col gap-4 transition-all duration-300 ease-out",
            isEditing
              ? "pointer-events-none absolute inset-0 -translate-y-2 opacity-0"
              : "translate-y-0 opacity-100",
          )}
        >
          {revenue == null ? (
            <>
              <AppText className="text-text-secondary text-sm font-medium">
                Не заполнена
              </AppText>
              <div>
                <Button
                  type="button"
                  variant={BUTTON_VARIANTS_VARIABLES.secondary}
                  className="min-w-[168px]"
                  onClick={startEditing}
                >
                  Внести выручку
                </Button>
              </div>
            </>
          ) : (
            <>
              <AppText
                size={TEXT_SIZES_VARIABLES.large}
                className="text-text-primary text-[32px] font-bold tabular-nums"
              >
                {moneyFormatter.format(revenue)} ₽
              </AppText>

              <div className="flex flex-col gap-1">
                <AppText className="text-text-secondary text-xs font-medium">
                  Последнее изменение:
                </AppText>
                <AppText className="text-text-primary text-sm font-semibold tabular-nums">
                  {lastUpdatedAt}
                </AppText>
              </div>

              {canEdit ? (
                <div>
                  <Button
                    type="button"
                    variant={BUTTON_VARIANTS_VARIABLES.secondary}
                    className="min-w-[168px]"
                    onClick={startEditing}
                  >
                    Редактировать
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div
          className={cn(
            "flex flex-col gap-4 transition-all duration-300 ease-out",
            isEditing
              ? "translate-y-0 opacity-100"
              : "pointer-events-none absolute inset-0 translate-y-2 opacity-0",
          )}
        >
          <div className="flex items-center gap-3">
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={draftValue}
              placeholder="Введите сумму"
              className="h-12 tabular-nums"
              onChange={(event) => {
                setDraftValue(sanitizeRevenueInput(event.target.value));
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSave();
                }

                if (event.key === "Escape") {
                  handleCancel();
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="flex-1"
              disabled={isSaveDisabled}
              onClick={handleSave}
            >
              Сохранить
            </Button>
            <Button
              type="button"
              variant={BUTTON_VARIANTS_VARIABLES.secondary}
              className="flex-1"
              onClick={handleCancel}
            >
              Отмена
            </Button>
          </div>
        </div>
      </div>
    </CardSurface>
  );
};
