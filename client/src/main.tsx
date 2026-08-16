import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { initI18n } from "@/i18n/index";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { setupGlobalErrorHandlers } from "@/shared/lib/errorHandler";

import "./app/layout/style.css";

export const queryCient = new QueryClient();

// Setup global error handlers for unhandled rejections and errors
setupGlobalErrorHandlers()


Promise.all([
  initI18n(),
  new Promise((resolve) => setTimeout(resolve, 3000))
])
  .catch((err) => {
    // initI18n can only fail if the non-English preload fetch fails.
    // English is always available — it is bundled in the JS and never fetched.
    console.warn("[i18n] Failed to preload language files; using bundled English fallback.", err)
  })
  .finally(() => {
    createRoot(document.getElementById("root")!).render(
      <QueryClientProvider client={queryCient}>
        {import.meta.env.DEV && <ReactQueryDevtools />}
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
  });