import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { Input, type InputProps } from "@/shared/ui/input";

interface FormInputProps<T extends FieldValues>
  extends Omit<InputProps, "name" | "value" | "defaultValue" | "onChange"> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}

export const FormInput = <T extends FieldValues>({
  control,
  name,
  label,
  id,
  ...props
}: FormInputProps<T>) => {
  const { field, fieldState } = useController({
    control,
    name,
  });

  const inputId = id ?? String(name);

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input
        {...props}
        {...field}
        id={inputId}
        value={typeof field.value === "string" ? field.value : ""}
        aria-invalid={fieldState.invalid}
      />
      <FieldError errors={[fieldState.error]} />
    </Field>
  );
};
