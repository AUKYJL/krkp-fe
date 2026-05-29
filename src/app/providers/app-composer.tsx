import { type FC, type PropsWithChildren, StrictMode } from "react";

import { ComposeChildren } from "@/shared/lib/compose-children";

import { AppQueryProvider } from "./app-query-provider";
import { AppRouterProvider } from "./app-router-provider";

export const AppComposer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ComposeChildren>
      <AppQueryProvider>
        <StrictMode>
          <AppRouterProvider />
          {children}
        </StrictMode>
      </AppQueryProvider>
    </ComposeChildren>
  );
};
