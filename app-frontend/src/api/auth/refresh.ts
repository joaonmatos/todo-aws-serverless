import { apiClient } from "./net";

export type RefreshTokenProps = {
  authBase: string;
  clientId: string;
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  idToken: string;
  expiresAt: Date;
};

export async function refreshToken(
  props: RefreshTokenProps
): Promise<RefreshTokenResponse> {
  const { authBase, clientId, refreshToken } = props;
  const client = apiClient(authBase);
  return await client.requestToken({
    clientId,
    refreshToken,
  });
}
