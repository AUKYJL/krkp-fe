export const BUTTON_VARIANTS_VARIABLES = {
  default: "default",
  link: "link",
  fancy: "fancy",
  icon: "icon",
} as const;

export const BUTTON_VARIANTS = {
  [BUTTON_VARIANTS_VARIABLES.default]:
    "bg-(--bg-secondary) text-text-contrast uppercase font-bold",
  [BUTTON_VARIANTS_VARIABLES.link]:
    "text-primary underline-offset-4 hover:underline uppercase",

  [BUTTON_VARIANTS_VARIABLES.fancy]: "bg-transparent",
  [BUTTON_VARIANTS_VARIABLES.icon]: "bg-transparent p-0",
};
