import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../hooks/use-auth";
import { z } from "zod";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { useEffect } from "react";
import { parseCallbackParameters } from "../../api/auth/callback";
import { exchangeToken } from "../../api/auth/exchange";

const searchParamSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const Route = createFileRoute("/auth/redirect")({
  component: RedirectAction,
  validateSearch: zodSearchValidator(searchParamSchema),
});

function RedirectAction() {
  const { state, dispatch } = useAuth();
  const params = Route.useSearch();

  const navigate = useNavigate();

  useEffect(() => {
    if (state.kind === "authenticated") {
      navigate({ to: "/" });
    } else if (state.kind === "configLoaded") {
      navigate({ to: "/auth/signin" });
    }

    if (state.kind === "authorizing") {
      const { code } = parseCallbackParameters(params, state.state);
      dispatch({
        kind: "resolveCode",
        code,
      });
    } else if (state.kind === "fetchedCode") {
      exchangeToken({
        authBase: state.config.baseUrls.auth,
        clientId: state.config.authClientId,
        redirectUri: state.redirectUri,
        code: state.code,
        pkceCode: state.pkce.code_verifier,
      }).then((response) =>
        dispatch({
          kind: "setCredentials",
          creds: response,
        })
      );
    }
  }, [state, dispatch, params, navigate]);

  return <></>;
}
