import { Link } from "@tanstack/react-router";
import clsx from "clsx";

import { AppText, TEXT_SIZES_VARIABLES, TEXT_VARIANTS_VARIABLES } from "@/shared/ui/app-text";

import type { TaxiparksSidebarNavItem as TaxiparksSidebarNavItemModel } from "../model/sidebar-nav-item";

interface Props {
  item: TaxiparksSidebarNavItemModel;
  isActive: boolean;
}

export const TaxiparksSidebarNavItem = ({ item, isActive }: Props) => {
  const textColor = isActive
    ? "text-dark-primary"
    : item.isMuted
      ? "text-text-inverse-subtle"
      : "text-text-inverse";

  const iconBg = isActive
    ? "bg-dark-primary-soft"
    : "bg-inverse-soft";
  const iconColor = isActive
    ? "text-dark-primary"
    : item.isMuted
      ? "text-text-inverse-subtle"
      : "text-text-inverse";

  return (
    <Link
      to={item.to}
      className={clsx(
        "flex w-full items-center gap-[10px] rounded-[10px] px-3 py-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-primary",
        isActive
          ? "bg-accent-primary"
          : "bg-background-sidebar hover:bg-accent-primary-soft",
      )}
    >
      <span
        className={clsx(
          "flex h-5 w-5 items-center justify-center rounded-[6px]",
          iconBg,
          iconColor,
        )}
        aria-hidden="true"
      >
        <span className="text-[12px] leading-none font-bold">{item.iconGlyph}</span>
      </span>

      <AppText
        variant={TEXT_VARIANTS_VARIABLES.inverse}
        size={TEXT_SIZES_VARIABLES.small}
        className={clsx("font-semibold", textColor)}
      >
        {item.label}
      </AppText>
    </Link>
  );
};
