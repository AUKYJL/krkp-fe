import { Loader2 } from "lucide-react";
import type { HTMLAttributes } from "react";

export const Spinner = ({ className }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 className="text-primary animate-spin" />
  </div>
);
