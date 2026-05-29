import { RouterProvider, createRouter } from "@tanstack/react-router";

import { queryClient } from "./app-query-provider";
import { routeTree } from "@/routeTree.gen";

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",

  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  defaultViewTransition: {
    types: ({ fromLocation, toLocation }) => {
      const fromIndex = fromLocation?.state.__TSR_index;
      const toIndex = toLocation.state.__TSR_index;

      if (fromIndex !== undefined && toIndex !== undefined) {
        if (fromIndex > toIndex) {
          //назад - справа налево
          return ["slide-right"];
        } else if (fromIndex < toIndex) {
          //вперед - слева направо
          return ["slide-left"];
        }
      }
      return [];
    },
  },
});

export type TRouter = typeof router;
// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: TRouter;
  }
}

export const AppRouterProvider = () => <RouterProvider router={router} />;
