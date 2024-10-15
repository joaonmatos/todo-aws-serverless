export type LogoutProps = {
  baseUrl: string;
  clientId: string;
  logoutUri: string;
};

export function logout(props: LogoutProps) {
  const { baseUrl, clientId, logoutUri } = props;

  const url = new URL("/logout", baseUrl);
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("logout_uri", logoutUri);

  window.location.replace(url);
}
