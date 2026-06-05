import { AlertTriangle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { BUTTON_VARIANTS_VARIABLES, Button } from "@/shared/ui/button";

export interface ConfirmDialogProps {
  trigger: ReactNode;
  title: ReactNode;
  description: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ComponentProps<typeof Button>["variant"];
  media?: ReactNode;
  contentSize?: "default" | "sm";
}

const defaultMedia = (
  <AlertDialogMedia>
    <AlertTriangle className="text-destructive" />
  </AlertDialogMedia>
);

export const ConfirmDialog = ({
  trigger,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Удалить",
  cancelText = "Отмена",
  confirmVariant = BUTTON_VARIANTS_VARIABLES.destructive,
  media = defaultMedia,
  contentSize = "sm",
}: ConfirmDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent size={contentSize}>
        <AlertDialogHeader>
          {media}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
