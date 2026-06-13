import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "@/app/layout/App";
import "./app/layout/style.css";

const queryCient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryCient}>
    <App />
  </QueryClientProvider>,
);
