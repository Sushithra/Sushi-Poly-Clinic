import { AppProviders } from "./providers.jsx";
import AppRouter from "../routes/AppRouter.jsx";

// Root frontend application shell.
// This remains intentionally thin so feature modules can be layered in incrementally.
export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
