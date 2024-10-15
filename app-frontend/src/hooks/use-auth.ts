import {
  Context,
  createContext,
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { getConfig } from "../api/config";
import useSessionStorageState from "use-session-storage-state";
import * as superjson from "superjson";
import { refreshToken } from "../api/auth/refresh";
import { AuthAction, AuthState } from "./types";
import { useNavigate } from "@tanstack/react-router";

export const EMPTY_AUTH: UseAuthResult = {
  state: { kind: "initial", updated: new Date(0) },
  dispatch: () => undefined,
  flushStorage: () => undefined,
  clearStorage: () => undefined,
};

function reducer(prev: AuthState, action: AuthAction): AuthState {
  if (action.kind === "overwrite") {
    return action.state;
  }

  if (prev.kind === "initial" && action.kind === "startLoadingConfig") {
    return { kind: "loadingConfig", updated: new Date() };
  }
  if (prev.kind === "loadingConfig" && action.kind === "resolveConfig") {
    return { kind: "configLoaded", updated: new Date(), config: action.config };
  }
  if (prev.kind === "configLoaded" && action.kind === "startAuthorize") {
    return {
      kind: "authorizing",
      updated: new Date(),
      config: prev.config,
      state: action.state,
      redirectUri: action.redirectUri,
      pkce: action.pkce,
    };
  }
  if (prev.kind === "authorizing" && action.kind === "resolveCode") {
    return {
      kind: "fetchedCode",
      updated: new Date(),
      config: prev.config,
      redirectUri: prev.redirectUri,
      state: prev.state,
      code: action.code,
      pkce: prev.pkce,
    };
  }
  if (prev.kind === "fetchedCode" && action.kind === "setCredentials") {
    return {
      kind: "authenticated",
      updated: new Date(),
      config: prev.config,
      redirectUri: prev.redirectUri,
      creds: action.creds,
    };
  }
  if (prev.kind === "authenticated" && action.kind === "setCredentials") {
    return {
      kind: "authenticated",
      updated: new Date(),
      config: prev.config,
      redirectUri: prev.redirectUri,
      creds: action.creds,
    };
  }
  if (
    (prev.kind === "authorizing" ||
      prev.kind === "fetchedCode" ||
      prev.kind === "authenticated") &&
    action.kind === "logOut"
  ) {
    return {
      kind: "configLoaded",
      updated: new Date(),
      config: prev.config,
    };
  }
  return prev;
}

export type UseAuthResult = {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
  flushStorage: () => void;
  clearStorage: () => void;
};

export function useLocalAuth(): UseAuthResult {
  const [storedContext, setStoredContext] = useSessionStorageState<AuthState>(
    "auth-context",
    {
      defaultValue: EMPTY_AUTH.state,
      serializer: superjson,
    }
  );
  const [state, dispatch] = useReducer(reducer, storedContext);

  useEffect(() => {
    if (state.updated > storedContext.updated) {
      setStoredContext(state);
    } else if (state.updated < storedContext.updated) {
      dispatch({ kind: "overwrite", state: storedContext });
    }
  }, [storedContext, setStoredContext, state, dispatch]);

  useEffect(() => {
    if (state.kind === "initial") {
      dispatch({ kind: "startLoadingConfig" });
    } else if (state.kind === "loadingConfig") {
      getConfig().then((config) => dispatch({ kind: "resolveConfig", config }));
    }
  }, [state, dispatch]);

  useEffect(() => {
    if (state.kind === "authenticated") {
      const shortlyBeforeExpiry = state.creds.expiresAt.getTime() - 30 * 1000;
      const now = Date.now();
      const timeRemaining = shortlyBeforeExpiry - now;
      if (timeRemaining <= 0) {
        return;
      }
      const handle = setTimeout(async () => {
        const response = await refreshToken({
          authBase: state.config.baseUrls.auth,
          clientId: state.config.authClientId,
          refreshToken: state.creds.refreshToken,
        });
        dispatch({
          kind: "setCredentials",
          creds: {
            accessToken: response.accessToken,
            idToken: response.idToken,
            refreshToken: state.creds.refreshToken,
            expiresAt: response.expiresAt,
          },
        });
      }, timeRemaining);
      return () => clearTimeout(handle);
    }
  }, [state, dispatch]);

  const flushStorage = useCallback(
    () => setStoredContext(state),
    [setStoredContext, state]
  );

  const clearStorage = useCallback(
    () => setStoredContext(EMPTY_AUTH.state),
    [setStoredContext]
  );

  return {
    state,
    dispatch,
    flushStorage,
    clearStorage,
  };
}

export const AuthContext: Context<UseAuthResult> = createContext<UseAuthResult>(
  {
    state: EMPTY_AUTH.state,
    dispatch: () => undefined,
    flushStorage: () => undefined,
    clearStorage: () => undefined,
  }
);

export function useAuth(): UseAuthResult {
  const context = useContext(AuthContext);
  return context;
}

export function useSignedIn() {
  const auth = useAuth();
  return auth.state.kind === "authenticated";
}

export function useCredentials() {
  const { state: auth } = useAuth();
  const navigate = useNavigate();
  if (auth.kind === "authenticated") {
    return auth.creds;
  }
  navigate({ to: "/auth/signin" });
}
