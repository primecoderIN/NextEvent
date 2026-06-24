import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { initI18n } from "@/i18n/index";
import App from "@/app/layout/App";
import "./app/layout/style.css";

export const queryCient = new QueryClient();


initI18n()
  .catch((err) => {
    // initI18n can only fail if the non-English preload fetch fails.
    // English is always available \u2014 it is bundled in the JS and never fetched.
    console.warn("[i18n] Failed to preload language files; using bundled English fallback.", err)
  })
  .finally(() => {
    createRoot(document.getElementById("root")!).render(
      <QueryClientProvider client={queryCient}>
        {import.meta.env.DEV && <ReactQueryDevtools />}

        <App />
      </QueryClientProvider>,
    );
  });
