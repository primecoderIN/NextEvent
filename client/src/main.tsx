import { createRoot } from "react-dom/client";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import App from "./app/layout/App";
import "./app/layout/style.css"



createRoot(document.getElementById("root")!).render(<App />);
