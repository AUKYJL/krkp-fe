import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type FormSelectOption = {
  value: string;
  label: string;
};

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  options: FormSelectOption[];
  disabled?: boolean;
}

export const FormSelect = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Выберите значение",
  options,
  disabled,
}: FormSelectProps<T>) => {
  const { field, fieldState } = useController({
    control,
    name,
  });

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Select
        value={typeof field.value === "string" ? field.value : undefined}
        onValueChange={field.onChange}
        disabled={disabled}
      >
        <SelectTrigger
          name={field.name}
          onBlur={field.onBlur}
          aria-invalid={fieldState.invalid}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldError errors={[fieldState.error]} />
    </Field>
  );
};
