import { type VariantProps, cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/shared/utils";

import {
  TEXT_SIZES,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS,
  TEXT_VARIANTS_VARIABLES,
} from "./constants";
import { TAG } from "./model";

const textVariant = cva("", {
  variants: {
    variant: TEXT_VARIANTS,
    size: TEXT_SIZES,
  },
  defaultVariants: {
    variant: TEXT_VARIANTS_VARIABLES.default,
    size: TEXT_SIZES_VARIABLES.default,
  },
});

type AppTextProps = HTMLAttributes<HTMLDivElement> & {
  highlight?: string | string[];
  classNameHighLight?: string;
  variant?: keyof typeof TEXT_VARIANTS_VARIABLES;
  size?: keyof typeof TEXT_SIZES_VARIABLES;
  tag?: TAG;
} & VariantProps<typeof textVariant> & {
    asChild?: boolean;
  };

const TextWrapper = ({
  children,
  variant,
  size,
  className,
  tag = TAG.p,
}: AppTextProps) => {
  const Tag = tag;

  return (
    <Tag className={cn(textVariant({ variant, size, className }))}>
      {children}
    </Tag>
  );
};

export const AppText = ({
  children,
  className,
  variant,
  size,
  tag,
}: AppTextProps) => {
  return (
    <TextWrapper variant={variant} size={size} tag={tag} className={className}>
      {children}
    </TextWrapper>
  );
};
