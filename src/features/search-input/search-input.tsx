import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/utils";

interface SearchInputProps {
  className?: string;
  inputClassName?: string;
  onChange: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value: string;
}

export const SearchInput = ({
  className,
  inputClassName,
  onChange,
  placeholder = "Поиск",
  value,
}: SearchInputProps) => {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="text-text-primary/70 pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value, event)}
        className={cn("pl-10", inputClassName)}
        placeholder={placeholder}
      />
    </div>
  );
};
