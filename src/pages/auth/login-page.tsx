import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  createLoginPayload,
  ensureCurrentUser,
  getApiErrorMessage,
  setAuthToken,
  useLoginMutation,
} from "@/shared/api/auth";
import { type LoginFormValues, loginSchema } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { FieldError, FieldGroup } from "@/shared/ui/field";
import { FormInput } from "@/shared/ui/form";

export const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  const handleFormSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);

    try {
      const response = await loginMutation.mutateAsync(createLoginPayload(values));

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
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
        />

        <FormInput
          control={control}
          name="password"
          label="Пароль"
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Введите пароль"
        />
      </FieldGroup>

      <FieldError className="rounded-[14px] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium">
        {submitError}
      </FieldError>

      <Button type="submit" disabled={isSubmitting}>
        Войти
      </Button>
    </form>
  );
};
