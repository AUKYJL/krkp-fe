import clsx from "clsx";

export const TEXT_VARIANTS_VARIABLES = {
  default: "default",
  title: "title",
  primary: "primary",
  contrast: "contrast",
  main: "main",
  inverse: "inverse",
  inverseMuted: "inverseMuted",
} as const;

export const TEXT_VARIANTS = {
  [TEXT_VARIANTS_VARIABLES.default]: clsx("text-text-secondary"),
  [TEXT_VARIANTS_VARIABLES.title]: clsx(
    "text-text-primary font-bold uppercase",
  ),
  [TEXT_VARIANTS_VARIABLES.primary]: clsx("text-text-primary uppercase"),
  [TEXT_VARIANTS_VARIABLES.contrast]: clsx(
    "text-text-contrast font-bold uppercase",
  ),
  [TEXT_VARIANTS_VARIABLES.main]: clsx("text-text-primary"),
  [TEXT_VARIANTS_VARIABLES.inverse]: clsx("text-text-inverse"),
  [TEXT_VARIANTS_VARIABLES.inverseMuted]: clsx(
    "text-text-inverse-muted",
  ),
};
