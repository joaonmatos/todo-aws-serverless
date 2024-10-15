import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    if (context.auth.state.kind !== "authenticated") {
      throw redirect({ to: "/auth/signin" });
    }
  },
});
