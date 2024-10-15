import { Zodios } from "@zodios/core";
import { z } from "zod";

const tokenRequestSchema = z
  .object({
    clientId: z.string(),
    redirectUri: z.string().optional(),
    code: z.string().optional(),
    codeVerifier: z.string().optional(),
    refreshToken: z.string().optional(),
  })
  .transform(({ clientId, redirectUri, code, codeVerifier, refreshToken }) => {
    if (redirectUri && code && codeVerifier) {
      return {
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
        code_verifier: codeVerifier,
      };
    } else if (refreshToken) {
      return {
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: refreshToken,
      };
    } else {
      throw new Error("Invalid token request");
    }
  });

const tokenResponseSchema = z
  .object({
    access_token: z.string(),
    id_token: z.string(),
    refresh_token: z.string().optional(),
    expires_in: z
      .number()
      .transform((exp) => new Date(Date.now() - 2000 + exp * 1000)),
  })
  .transform(({ access_token, id_token, refresh_token, expires_in }) => ({
    accessToken: access_token,
    idToken: id_token,
    refreshToken: refresh_token,
    expiresAt: expires_in,
  }));

export function apiClient(authBase: string) {
  return new Zodios(authBase, [
    {
      method: "post",
      path: "/oauth2/token",
      alias: "requestToken",
      requestFormat: "form-url",
      parameters: [
        {
          name: "req",
          type: "Body",
          schema: tokenRequestSchema,
        },
      ],
      response: tokenResponseSchema,
    },
  ]);
}
