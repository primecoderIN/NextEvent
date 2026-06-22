import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// Import i18n before App — initializes i18next synchronously (static JSON imports,
// no HTTP fetch) so every component gets t() on the very first render.
import "@/i18n/index";
import App from "@/app/layout/App";
import "./app/layout/style.css";

export const queryCient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryCient}>
    {import.meta.env.DEV && <ReactQueryDevtools />}

    <App />
  </QueryClientProvider>,
);
