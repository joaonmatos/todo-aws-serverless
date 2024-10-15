import { Config } from "../api/config";
import { PkceChallengePair } from "../util/pkce";

type Initial = {
  kind: "initial";
  updated: Date;
};

type LoadingConfig = {
  kind: "loadingConfig";
  updated: Date;
};

type ConfigLoaded = {
  kind: "configLoaded";
  updated: Date;
  config: Config;
};

type Authorizing = {
  kind: "authorizing";
  updated: Date;
  config: Config;
  redirectUri: string;
  state: string;
  pkce: PkceChallengePair;
};

type FetchedCode = {
  kind: "fetchedCode";
  updated: Date;
  config: Config;
  redirectUri: string;
  state: string;
  code: string;
  pkce: PkceChallengePair;
};

type Authenticated = {
  kind: "authenticated";
  updated: Date;
  config: Config;
  redirectUri: string;
  creds: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
};

export type AuthState =
  | Initial
  | LoadingConfig
  | ConfigLoaded
  | Authorizing
  | FetchedCode
  | Authenticated;

type StartLoadingConfig = {
  kind: "startLoadingConfig";
};

type ResolveConfig = {
  kind: "resolveConfig";
  config: Config;
};

type StartAuthorize = {
  kind: "startAuthorize";
  state: string;
  redirectUri: string;
  pkce: PkceChallengePair;
};

type ResolveCode = {
  kind: "resolveCode";
  code: string;
};

type SetCredentials = {
  kind: "setCredentials";
  creds: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
};

type LogOut = {
  kind: "logOut";
};

type Overwrite = {
  kind: "overwrite";
  state: AuthState;
};

export type AuthAction =
  | StartLoadingConfig
  | ResolveConfig
  | StartAuthorize
  | ResolveCode
  | SetCredentials
  | LogOut
  | Overwrite;
