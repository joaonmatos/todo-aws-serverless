import { apiClient } from "./net";

export type ExchangeTokenProps = {
  authBase: string;
  clientId: string;
  redirectUri: string;
  code: string;
  pkceCode: string;
};

export type ExchangeTokenResponse = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: Date;
};

export async function exchangeToken(
  props: ExchangeTokenProps
): Promise<ExchangeTokenResponse> {
  const { authBase, clientId, redirectUri, code, pkceCode } = props;
  const client = apiClient(authBase);
  const result = await client.requestToken({
    clientId,
    redirectUri,
    code,
    codeVerifier: pkceCode,
  });
  return { ...result, refreshToken: result.refreshToken! };
}
