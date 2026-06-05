import { Link, Outlet, useRouterState } from "@tanstack/react-router";

import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";
import { CardSurface } from "@/shared/ui/card-surface";
import { cn } from "@/shared/utils";

const authTabs = [
  {
    to: "/auth/login" as const,
    label: "Вход",
  },
  {
    to: "/auth/register" as const,
    label: "Регистрация",
  },
];

export const AuthLayoutPage = () => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <main className="bg-background-page flex min-h-dvh w-full flex-col items-center justify-center px-4 py-8 sm:px-6">
      <CardSurface className="w-full max-w-[460px] gap-6 rounded-[24px] p-5 shadow-[0_20px_50px_0_rgba(35,35,35,0.08)] sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-text-primary text-[28px] leading-tight font-bold">
              Личный кабинет
            </h1>
            <p className="text-text-primary/70 text-sm leading-6 font-medium">
              Войдите или создайте аккаунт, чтобы открыть рабочее пространство.
            </p>
          </div>

          <div className="bg-background-page grid grid-cols-2 gap-2 rounded-[14px] p-1">
            {authTabs.map((tab) => {
              const isActive = pathname === tab.to;

              return (
                <Button
                  key={tab.to}
                  type="button"
                  asChild
                  variant={
                    isActive
                      ? BUTTON_VARIANTS_VARIABLES.default
                      : BUTTON_VARIANTS_VARIABLES.secondary
                  }
                  className={cn(
                    "h-11 rounded-[10px] text-sm font-semibold",
                    !isActive &&
                      "hover:bg-background-card border-transparent bg-transparent",
                  )}
                >
                  <Link to={tab.to}>{tab.label}</Link>
                </Button>
              );
            })}
          </div>
        </div>

        <Outlet />
      </CardSurface>
    </main>
  );
};
