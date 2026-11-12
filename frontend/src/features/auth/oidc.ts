import type { AuthProviderProps } from "react-oidc-context";

const authority = import.meta.env.VITE_OIDC_AUTHORITY;
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
const redirectUri =
  import.meta.env.VITE_OIDC_REDIRECT_URI ?? `${window.location.origin}/auth/callback`;
const postLogoutRedirectUri =
  import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI ?? `${window.location.origin}/`;

export const oidcSettings: AuthProviderProps | null =
  authority && clientId
    ? {
        authority,
        client_id: clientId,
        redirect_uri: redirectUri,
        post_logout_redirect_uri: postLogoutRedirectUri,
        response_type: "code",
        scope: "openid profile email",
        automaticSilentRenew: true,
        monitorSession: false,
        onSigninCallback: () => {
          window.history.replaceState({}, document.title, window.location.pathname);
        },
      }
    : null;
