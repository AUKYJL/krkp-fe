import { CalendarIcon } from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  useId,
  useState,
} from "react";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Field, FieldLabel } from "@/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { cn } from "@/shared/utils";

export type DateRangePickerValue = DateRange | undefined;

export interface DateRangePickerProps {
  id?: string;
  className?: string;
  buttonClassName?: string;
  popoverContentClassName?: string;
  label?: string;
  placeholder?: string;
  value?: DateRangePickerValue;
  defaultValue?: DateRangePickerValue;
  onChange?: (value: DateRangePickerValue) => void;
  disabled?: boolean;
  numberOfMonths?: number;
  formatDate?: (date: Date) => string;
  renderValue?: (value: DateRangePickerValue) => ReactNode;
  fieldProps?: Omit<ComponentProps<typeof Field>, "children" | "className">;
  buttonProps?: Omit<
    ComponentProps<typeof Button>,
    "children" | "className" | "id" | "onChange" | "value"
  >;
  popoverContentProps?: Omit<
    ComponentProps<typeof PopoverContent>,
    "children" | "className"
  >;
  calendarProps?: Omit<
    ComponentProps<typeof Calendar>,
    "mode" | "selected" | "onSelect" | "defaultMonth" | "numberOfMonths"
  >;
}

const defaultFormatDate = (date: Date) => format(date, "LLL dd, y");

const getDisplayValue = ({
  formatDate,
  placeholder,
  renderValue,
  value,
}: {
  formatDate: (date: Date) => string;
  placeholder: string;
  renderValue?: DateRangePickerProps["renderValue"];
  value: DateRangePickerValue;
}) => {
  if (renderValue) {
    return renderValue(value);
  }

  if (!value?.from) {
    return <span>{placeholder}</span>;
  }

  if (!value.to) {
    return formatDate(value.from);
  }

  return `${formatDate(value.from)} - ${formatDate(value.to)}`;
};

export const DateRangePicker = (props: DateRangePickerProps) => {
  const {
    id,
    className,
    buttonClassName,
    popoverContentClassName,
    label,
    placeholder = "Выберите период",
    value,
    defaultValue,
    onChange,
    disabled = false,
    numberOfMonths = 2,
    formatDate = defaultFormatDate,
    renderValue,
    fieldProps,
    buttonProps,
    popoverContentProps,
    calendarProps,
  } = props;
  const generatedId = useId().replace(/:/g, "");
  const inputId = id ?? `date-range-picker-${generatedId}`;
  const [internalValue, setInternalValue] =
    useState<DateRangePickerValue>(defaultValue);
  const isControlled = Object.prototype.hasOwnProperty.call(props, "value");
  const selectedRange = isControlled ? value : internalValue;

  const handleSelect = (nextValue: DateRangePickerValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  };

  return (
    <Field className={cn("w-full", className)} {...fieldProps}>
      {label ? <FieldLabel htmlFor={inputId}>{label}</FieldLabel> : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={inputId}
            type="button"
            disabled={disabled}
            className={cn(
              "w-full justify-start px-2.5 text-left font-normal",
              !selectedRange?.from && "text-muted-foreground",
              buttonClassName,
            )}
            {...buttonProps}
          >
            <CalendarIcon className="size-4 shrink-0" />
            <span className="truncate">
              {getDisplayValue({
                formatDate,
                placeholder,
                renderValue,
                value: selectedRange,
              })}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn("w-auto p-0", popoverContentClassName)}
          {...popoverContentProps}
        >
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={handleSelect}
            defaultMonth={selectedRange?.from}
            numberOfMonths={numberOfMonths}
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
};
