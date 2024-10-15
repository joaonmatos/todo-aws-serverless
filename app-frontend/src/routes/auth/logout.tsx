import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../../hooks/use-auth";
import { logout } from "../../api/auth/logout";

export const Route = createFileRoute("/auth/logout")({
  component: LogOutRedirect,
});

function LogOutRedirect() {
  const { state, dispatch, clearStorage } = useAuth();

  useEffect(() => {
    if (
      state.kind === "authenticated" ||
      state.kind === "authorizing" ||
      state.kind === "fetchedCode"
    ) {
      dispatch({ kind: "logOut" });
    } else if (state.kind === "configLoaded") {
      clearStorage();
      logout({
        baseUrl: state.config.baseUrls.auth,
        clientId: state.config.authClientId,
        logoutUri: `${window.location.origin}/`,
      });
    }
  }, [state, dispatch]);
}
