export const BUTTON_SIZES_VARIABLES = {
  default: "default",
  link: "link",
  icon: "icon",
} as const;

export const BUTTON_SIZES = {
  [BUTTON_SIZES_VARIABLES.default]:
    "h-10.5 px-4 py-2.5 has-[>svg]:px-3 rounded-[999px]",
  [BUTTON_SIZES_VARIABLES.link]: "",
  [BUTTON_SIZES_VARIABLES.icon]: "",
};
