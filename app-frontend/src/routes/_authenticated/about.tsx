import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/about")({
  component: () => <div>Hello /_authenticated/about!</div>,
});
