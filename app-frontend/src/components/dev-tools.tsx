import React from "react";

async function loadRouterDevTools() {
  const module = import("@tanstack/router-devtools");
  return {
    default: (await module).TanStackRouterDevtools,
  };
}

function NullComponent() {
  return null;
}

const LazyRouterDevTools = React.lazy(loadRouterDevTools);

export const RouterDevTools =
  process.env.NODE_ENV === "production" ? NullComponent : LazyRouterDevTools;
