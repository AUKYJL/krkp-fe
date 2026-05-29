import clsx from "clsx";

export const TEXT_SIZES_VARIABLES = {
  xss: "xss",
  xs: "xs",
  default: "default",
  small: "small",
  medium: "medium",
  large: "large",
} as const;

export const TEXT_SIZES = {
  [TEXT_SIZES_VARIABLES.xss]: clsx("text-[12px] leading-none"),
  [TEXT_SIZES_VARIABLES.xs]: clsx("text-[12px] leading-none"),
  [TEXT_SIZES_VARIABLES.default]: clsx("text-[14px] leading-none"),
  [TEXT_SIZES_VARIABLES.small]: clsx("text-[14px] leading-none"),
  [TEXT_SIZES_VARIABLES.medium]: clsx("text-[18px] leading-none"),
  [TEXT_SIZES_VARIABLES.large]: clsx("text-[28px] leading-none"),
};
