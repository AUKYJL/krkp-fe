import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { type LoginFormValues, loginSchema } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { FieldGroup } from "@/shared/ui/field";
import { FormInput } from "@/shared/ui/form";

export const LoginPage = () => {
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

  const handleFormSubmit = (values: LoginFormValues) => {
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

      <Button type="submit" disabled={isSubmitting}>
        Войти
      </Button>
    </form>
  );
};
