import clsx from "clsx";
import type { FC, ReactNode } from "react";

interface Props {
  className?: string;
  children: ReactNode;
}

export const Container: FC<Props> = ({ className, children }) => {
  return (
    <div className={clsx(className, "m-auto flex w-full flex-col px-4")}>
      {children}
    </div>
  );
};
