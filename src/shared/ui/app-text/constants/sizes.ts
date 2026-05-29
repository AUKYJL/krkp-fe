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
  [TEXT_SIZES_VARIABLES.xss]: clsx("text-[13px] leading-[100%]"),
  [TEXT_SIZES_VARIABLES.xs]: clsx("text-[14px] leading-[100%]"),
  [TEXT_SIZES_VARIABLES.default]: clsx("text-[15px] leading-[100%]"),
  [TEXT_SIZES_VARIABLES.small]: clsx("text-[17px] leading-[100%]"),
  [TEXT_SIZES_VARIABLES.medium]: clsx("text-[22px] leading-[100%]"),
  [TEXT_SIZES_VARIABLES.large]: clsx("text-[27px]  leading-[100%]"),
};
