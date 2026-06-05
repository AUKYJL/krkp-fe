import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";

import {
  Combobox,
  type ComboboxOption,
  type ComboboxProps,
} from "@/shared/ui/combobox";
import { Field, FieldError, FieldLabel } from "@/shared/ui/field";

interface FormComboboxProps<T extends FieldValues>
  extends Omit<ComboboxProps, "value" | "onValueChange" | "options"> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: ComboboxOption[];
}

export const FormCombobox = <T extends FieldValues>({
  control,
  name,
  label,
  options,
  ...props
}: FormComboboxProps<T>) => {
  const { field, fieldState } = useController({
    control,
    name,
  });

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Combobox
        {...props}
        name={field.name}
        value={typeof field.value === "string" ? field.value : ""}
        onValueChange={field.onChange}
        onBlur={field.onBlur}
        options={options}
        aria-invalid={fieldState.invalid}
      />
      <FieldError errors={[fieldState.error]} />
    </Field>
  );
};
