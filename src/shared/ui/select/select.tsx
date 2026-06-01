import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/shared/utils";

const getPortalContainer = () => {
  if (typeof document === "undefined") return undefined;
  const themeRoot =
    document.querySelector<HTMLElement>('[class^="theme-"]') ??
    document.querySelector<HTMLElement>('[class*=" theme-"]');

  return themeRoot ?? document.getElementById("root") ?? document.body;
};

const Select = (props: ComponentProps<typeof SelectPrimitive.Root>) => {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
};

const SelectGroup = (
  props: ComponentProps<typeof SelectPrimitive.Group>,
) => {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
};

const SelectValue = (
  props: ComponentProps<typeof SelectPrimitive.Value>,
) => {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
};

const SelectTrigger = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) => {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-[12px] border border-border-default bg-background-card px-3 py-2 text-sm text-text-primary shadow-none outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 opacity-70" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
};

const SelectContent = ({
  className,
  children,
  position = "popper",
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) => {
  const portalContainer = getPortalContainer();

  return (
    <SelectPrimitive.Portal
      data-slot="select-portal"
      container={portalContainer}
    >
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-[14px] border border-border-default bg-background-card text-text-primary shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
};

const SelectLabel = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Label>) => {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs font-semibold opacity-70", className)}
      {...props}
    />
  );
};

const SelectItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) => {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-[10px] py-2 pr-8 pl-2 text-sm outline-none transition-colors",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[highlighted]:bg-dark-primary-soft data-[highlighted]:text-text-primary",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
};

const SelectSeparator = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) => {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border-default -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
};

const SelectScrollUpButton = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpButton>) => {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up"
      className={cn(
        "flex cursor-default items-center justify-center py-1 text-text-primary",
        className,
      )}
      {...props}
    >
      <ChevronUp className="size-4 opacity-70" />
    </SelectPrimitive.ScrollUpButton>
  );
};

const SelectScrollDownButton = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) => {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down"
      className={cn(
        "flex cursor-default items-center justify-center py-1 text-text-primary",
        className,
      )}
      {...props}
    >
      <ChevronDown className="size-4 opacity-70" />
    </SelectPrimitive.ScrollDownButton>
  );
};

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
