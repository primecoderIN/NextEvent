import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { initI18n } from "@/i18n/index";
import App from "@/app/layout/App";
import "./app/layout/style.css";

export const queryCient = new QueryClient();


initI18n()
  .catch(() => {
    console.error("Failed to fetch language files. Falling back to bundled English translations:");
  })
  .finally(() => {
    createRoot(document.getElementById("root")!).render(
      <QueryClientProvider client={queryCient}>
        {import.meta.env.DEV && <ReactQueryDevtools />}

        <App />
      </QueryClientProvider>,
    );
  });
