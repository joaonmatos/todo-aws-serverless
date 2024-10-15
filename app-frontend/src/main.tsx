import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import {
  AuthContext,
  EMPTY_AUTH,
  useAuth,
  useLocalAuth,
} from "./hooks/use-auth";

const router = createRouter({ routeTree, context: { auth: EMPTY_AUTH } });

function AuthProviderLayer({
  children,
}: {
  children?: React.ReactNode | React.ReactNode[];
}) {
  const auth = useLocalAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

function RouterProviderLayer() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AuthProviderLayer>
        <RouterProviderLayer />
      </AuthProviderLayer>
    </StrictMode>
  );
}
