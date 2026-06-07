import {
  DateRangePicker,
  type DateRangePickerValue,
} from "@/features/date-range-picker";
import { BUTTON_VARIANTS_VARIABLES } from "@/shared/ui/button";

type TaxiparksPeriodFilterProps = {
  value: DateRangePickerValue;
  onChange: (value: DateRangePickerValue) => void;
};

export const TaxiparksPeriodFilter = ({
  value,
  onChange,
}: TaxiparksPeriodFilterProps) => {
  return (
    <div className="w-full sm:w-[320px]">
      <DateRangePicker
        value={value}
        onChange={onChange}
        numberOfMonths={2}
        placeholder="Выберите период"
        buttonClassName="h-10 rounded-[12px]"
        buttonProps={{
          variant: BUTTON_VARIANTS_VARIABLES.secondary,
        }}
        formatDate={(date) =>
          date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        }
        renderValue={(nextValue) => {
          if (!nextValue?.from) {
            return "Выберите период";
          }

          if (!nextValue.to) {
            return nextValue.from.toLocaleDateString("ru-RU");
          }

          return `${nextValue.from.toLocaleDateString("ru-RU")} - ${nextValue.to.toLocaleDateString("ru-RU")}`;
        }}
        popoverContentProps={{
          align: "end",
        }}
        calendarProps={{
          captionLayout: "dropdown",
        }}
      />
    </div>
  );
};
