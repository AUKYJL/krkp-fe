"use client";

import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronDown, Search } from "lucide-react";
import { useMemo, useState, type ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/utils";

const getPortalContainer = () => {
  if (typeof document === "undefined") return undefined;

  const themeRoot =
    document.querySelector<HTMLElement>('[class^="theme-"]') ??
    document.querySelector<HTMLElement>('[class*=" theme-"]');

  return themeRoot ?? document.getElementById("root") ?? document.body;
};

export type ComboboxOption = {
  value: string;
  label: string;
  keywords?: string[];
};

export type ComboboxProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onChange"
> & {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
};

export const Combobox = ({
  className,
  options,
  value,
  onValueChange,
  placeholder = "Выберите значение",
  searchPlaceholder = "Поиск...",
  emptyText = "Ничего не найдено",
  disabled,
  "aria-invalid": ariaInvalid,
  ...props
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const haystack = [option.label, option.value, ...(option.keywords ?? [])]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [options, query]);

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue === value ? "" : nextValue);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setQuery("");
        }
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          data-slot="combobox-trigger"
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-[12px] border border-border-default bg-background-page px-3 py-2 text-left text-sm text-text-primary shadow-none outline-none transition-[border-color,box-shadow]",
            "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0",
            "aria-invalid:border-status-error aria-invalid:ring-2 aria-invalid:ring-status-error/15",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        >
          <span
            className={cn(
              "truncate",
              !selectedOption && "text-text-primary/60",
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-70" />
        </button>
      </Popover.Trigger>

      <Popover.Portal container={getPortalContainer()}>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[280px] rounded-[14px] border border-border-default bg-background-card p-1 shadow-md outline-none"
        >
          <Command
            shouldFilter={false}
            className="flex flex-col gap-1"
          >
            <div className="relative">
              <Search className="text-text-primary/50 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder={searchPlaceholder}
                className="text-text-primary placeholder:text-text-primary/60 border-border-default bg-background-page flex h-10 w-full rounded-[10px] border py-2 pr-3 pl-9 text-sm font-medium shadow-none outline-none transition-[border-color,box-shadow] focus-visible:border-dark-primary focus-visible:ring-2 focus-visible:ring-dark-primary/10"
              />
            </div>

            <Command.List className="max-h-64 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <Command.Empty className="text-text-primary/60 px-2 py-4 text-center text-sm font-medium">
                  {emptyText}
                </Command.Empty>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <Command.Item
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-[10px] px-2 py-2 text-sm font-medium text-text-primary outline-none transition-colors",
                        "data-[selected=true]:bg-dark-primary-soft",
                      )}
                    >
                      <Check
                        className={cn(
                          "size-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </Command.Item>
                  );
                })
              )}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
