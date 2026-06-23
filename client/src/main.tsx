import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { initI18n } from "@/i18n/index";
import App from "@/app/layout/App";
import "./app/layout/style.css";

export const queryCient = new QueryClient();

// Initialise i18n first — awaits common + nav namespace HTTP fetches so layout
// components always get real strings on the very first render. All other
// namespaces (home, eventDetail, createEvent) are loaded on demand when their
// routes are first visited.
initI18n().then(() => {
  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryCient}>
      {import.meta.env.DEV && <ReactQueryDevtools />}

      <App />
    </QueryClientProvider>,
  );
});
