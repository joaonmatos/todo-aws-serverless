export type AuthorizeProps = {
  baseUrl: string;
  clientId: string;
  redirectUri: string;
  state: string;
  pkceChallenge: string;
};

export function authorize(props: AuthorizeProps) {
  const { baseUrl, clientId, redirectUri, state, pkceChallenge } = props;

  const url = new URL("/oauth2/authorize", baseUrl);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("state", state);
  url.searchParams.append("code_challenge_method", "S256");
  url.searchParams.append("code_challenge", pkceChallenge);

  window.location.replace(url);
}
