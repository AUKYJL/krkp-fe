import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  type RegisterFormValues,
  authRoleOptions,
  registerSchema,
} from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { FieldGroup } from "@/shared/ui/field";
import { FormInput, FormSelect } from "@/shared/ui/form";

export const RegisterPage = () => {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      repeatedPassword: "",
      role: undefined,
    },
  });

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  const handleFormSubmit = (values: RegisterFormValues) => {
    void values;
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-6"
    >
      <FieldGroup>
        <FormInput
          control={control}
          name="email"
          label="Email"
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
        />

        <FormInput
          control={control}
          name="fullName"
          label="Имя и фамилия"
          id="register-full-name"
          autoComplete="name"
          placeholder="Иван Петров"
        />

        <FormInput
          control={control}
          name="password"
          label="Пароль"
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="Придумайте пароль"
        />

        <FormInput
          control={control}
          name="repeatedPassword"
          label="Повторите пароль"
          id="register-repeated-password"
          type="password"
          autoComplete="new-password"
          placeholder="Повторите пароль"
        />

        <FormSelect
          control={control}
          name="role"
          label="Роль"
          placeholder="Выберите роль"
          options={[...authRoleOptions]}
        />
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting}>
        Зарегистрироваться
      </Button>
    </form>
  );
};
