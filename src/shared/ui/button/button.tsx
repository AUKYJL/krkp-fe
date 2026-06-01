import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/shared/utils";

import {
  BUTTON_SIZES,
  BUTTON_SIZES_VARIABLES,
  BUTTON_VARIANTS,
  BUTTON_VARIANTS_VARIABLES,
} from "./constants";

const buttonVariants = cva(
  "inline-flex items-center duration-300 cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-[14px] font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none  shrink-0 [&_svg]:shrink-0 outline-none  aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive select-none",
  {
    variants: {
      variant: BUTTON_VARIANTS,
      size: BUTTON_SIZES,
    },
    defaultVariants: {
      variant: BUTTON_VARIANTS_VARIABLES.default,
      size: BUTTON_SIZES_VARIABLES.default,
    },
  },
);

export const Button = ({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
