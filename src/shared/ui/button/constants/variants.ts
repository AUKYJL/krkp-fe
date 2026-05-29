export const BUTTON_VARIANTS_VARIABLES = {
  default: "default",
  link: "link",
  fancy: "fancy",
  icon: "icon",
  primary: "primary",
  secondary: "secondary",
  tertiary: "tertiary",
} as const;

export const BUTTON_VARIANTS = {
  [BUTTON_VARIANTS_VARIABLES.default]:
    "bg-accent-primary text-text-primary font-bold hover:text-text-inverse",
  [BUTTON_VARIANTS_VARIABLES.link]:
    "text-primary underline-offset-4 hover:underline uppercase",
  [BUTTON_VARIANTS_VARIABLES.fancy]: "bg-transparent",
  [BUTTON_VARIANTS_VARIABLES.icon]: "bg-transparent p-0",

  [BUTTON_VARIANTS_VARIABLES.secondary]:
    "bg-background-card text-text-primary border border-border-default font-bold hover:bg-dark-primary-soft",
  [BUTTON_VARIANTS_VARIABLES.tertiary]:
    "bg-dark-primary text-text-inverse border border-border-default font-bold hover:bg-dark-primary/85",
};
