import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  createRegisterPayload,
  ensureCurrentUser,
  getApiErrorMessage,
  setAuthToken,
  useRegisterMutation,
} from "@/shared/api/auth";
import {
  type RegisterFormValues,
  authRoleOptions,
  registerSchema,
} from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { FieldError, FieldGroup } from "@/shared/ui/field";
import { FormInput, FormSelect } from "@/shared/ui/form";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();
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

  const handleFormSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null);

    try {
      const response = await registerMutation.mutateAsync(
        createRegisterPayload(values),
      );

      setAuthToken(response.accessToken);
      await ensureCurrentUser(queryClient);
      await navigate({ to: "/" });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
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

      <FieldError className="rounded-[14px] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium">
        {submitError}
      </FieldError>

      <Button type="submit" disabled={isSubmitting}>
        Зарегистрироваться
      </Button>
    </form>
  );
};
