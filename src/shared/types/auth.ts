import { z } from "zod";

export enum ROLE {
  DRIVER = "DRIVER",
  DIRECTOR = "DIRECTOR",
}

export const authRoleOptions = [
  {
    value: ROLE.DRIVER,
    label: "Водитель",
  },
  {
    value: ROLE.DIRECTOR,
    label: "Директор",
  },
] as const;

export const loginSchema = z.object({
  email: z.email("Укажите корректный email"),
  password: z.string().min(1, "Укажите пароль"),
});

export const registerSchema = z
  .object({
    email: z.email("Укажите корректный email"),
    fullName: z.string().trim().min(1, "Укажите имя и фамилию"),
    password: z.string().min(1, "Укажите пароль"),
    repeatedPassword: z.string().min(1, "Повторите пароль"),
    role: z.enum([ROLE.DRIVER, ROLE.DIRECTOR], {
      error: "Выберите роль",
    }),
  })
  .refine((values) => values.password === values.repeatedPassword, {
    message: "Пароли не совпадают",
    path: ["repeatedPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
