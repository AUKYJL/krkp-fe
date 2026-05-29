import * as DialogPrimitive from "@radix-ui/react-dialog";
import bridge from "@vkontakte/vk-bridge";
import clsx from "clsx";
import * as React from "react";

import { cn } from "@/shared/utils";

import XSvg from "@/assets/icons/x.svg";

import {
  AppText,
  TEXT_SIZES_VARIABLES,
  TEXT_VARIANTS_VARIABLES,
} from "../app-text";

import { Image } from "@/features/image/image";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  title = "",
  topImage = "",
  topImageClassName = "",
  footerSlot = null,
  staticSlot = null,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  title: string;
  topImage?: string;
  topImageClassName?: string;
  footerSlot?: React.ReactNode;
  staticSlot?: React.ReactNode;
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />

      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-0 data-[state=open]:zoom-in-0 fixed top-[50%] left-[50%] z-[52] w-full max-w-[calc(100%-3rem)] translate-x-[-50%] translate-y-[-50%] duration-200 sm:max-w-[380px]",
          className,
        )}
        {...props}
      >
        {topImage && (
          <div className="pointer-events-none absolute top-0 left-1/2 z-[-1] w-screen origin-bottom -translate-x-1/2 translate-y-[-100%] scale-50">
            <Image
              src={topImage}
              alt="squirrel"
              className={clsx(topImageClassName, "max-w-none")}
            />
          </div>
        )}

        <div className="grid gap-4 bg-(--bg-primary) px-4 py-5">
          {title && (
            <DialogHeader className="mx-5">
              <DialogTitle className="text-center">
                <AppText
                  variant={TEXT_VARIANTS_VARIABLES.primary}
                  size={TEXT_SIZES_VARIABLES.medium}
                >
                  {title}
                </AppText>
              </DialogTitle>
            </DialogHeader>
          )}
          {staticSlot}
          <div className="hide-horizontal-scrollbar max-h-[50vh] overflow-y-auto">
            {children}
          </div>

          {footerSlot && (
            <DialogFooter className="z-2">{footerSlot}</DialogFooter>
          )}
        </div>

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-3 right-2 flex h-8 w-8 cursor-pointer items-center justify-center transition-transform duration-300 outline-none hover:scale-115 hover:opacity-100 focus:outline-hidden"
            onClick={() =>
              bridge
                .send("VKWebAppTapticImpactOccurred", {
                  style: "light",
                })
                .catch(() => {})
            }
          >
            <XSvg className="text-[22px] text-(--bg-secondary)" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
