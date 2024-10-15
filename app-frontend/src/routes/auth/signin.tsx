import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../hooks/use-auth";
import { useEffect } from "react";
import pkceChallenge, { random } from "../../util/pkce";
import { authorize } from "../../api/auth/authorize";

export const Route = createFileRoute("/auth/signin")({
  component: SignInRedirect,
});

function SignInRedirect() {
  const { state, dispatch, flushStorage } = useAuth();

  const redirectUri = new URL("/auth/redirect", window.location.origin);
  const navigate = useNavigate();

  useEffect(() => {
    const innerEffect = async () => {
      if (state.kind === "authenticated") {
        await navigate({ to: "/" });
      } else if (state.kind === "configLoaded") {
        const nonce = random(64);
        const pair = await pkceChallenge(96);
        dispatch({
          kind: "startAuthorize",
          state: nonce,
          redirectUri: redirectUri.toString(),
          pkce: pair,
        });
      } else if (state.kind === "authorizing") {
        authorize({
          baseUrl: state.config.baseUrls.auth,
          clientId: state.config.authClientId,
          redirectUri: redirectUri.toString(),
          state: state.state,
          pkceChallenge: state.pkce.code_challenge,
        });
      } else if (state.kind === "fetchedCode") {
        dispatch({ kind: "logOut" });
      }
    };
    innerEffect();
  }, [state, dispatch, flushStorage, navigate]);

  return <></>;
}
