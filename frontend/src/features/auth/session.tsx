import { createContext, type ReactNode, useContext, useEffect } from "react";
import { AuthProvider, useAuth } from "react-oidc-context";
import { setAccessToken } from "@/lib/api/access-token";
import { useMockEnvironment } from "./mock-environment";
import { oidcSettings } from "./oidc";
import { extractRoles, permissionsFor, type Role, roleLabels } from "./roles";

export type SessionStatus = "loading" | "anonymous" | "authenticated";

export interface Session {
  status: SessionStatus;
  name: string | null;
  username: string | null;
  roles: Role[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  signInAvailable: boolean;
  signIn: () => void;
  signOut: () => void;
  error: string | null;
}

const baseSession: Session = {
  status: "anonymous",
  name: null,
  username: null,
  roles: [],
  canCreate: false,
  canEdit: false,
  canDelete: false,
  signInAvailable: false,
  signIn: () => undefined,
  signOut: () => undefined,
  error: null,
};

function buildSession(overrides: Partial<Session>): Session {
  const roles = overrides.roles ?? [];
  return {
    ...baseSession,
    ...permissionsFor(roles),
    ...overrides,
    roles,
  };
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { enabled } = useMockEnvironment();
  if (enabled) return <MockSession>{children}</MockSession>;
  if (!oidcSettings) {
    return (
      <SessionContext.Provider
        value={{
          ...baseSession,
          error: "Sign-in is not configured for this environment.",
        }}
      >
        {children}
      </SessionContext.Provider>
    );
  }
  return (
    <AuthProvider {...oidcSettings}>
      <OidcSession>{children}</OidcSession>
    </AuthProvider>
  );
}

function MockSession({ children }: { children: ReactNode }) {
  const { role, setRole } = useMockEnvironment();
  const session =
    role === "anonymous"
      ? buildSession({
          status: "anonymous",
          signInAvailable: true,
          signIn: () => setRole("editor"),
        })
      : buildSession({
          status: "authenticated",
          name: `${roleLabels[role]} (demo)`,
          username: role,
          roles: [role],
          signInAvailable: true,
          signIn: () => setRole("editor"),
          signOut: () => setRole("anonymous"),
        });
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

function OidcSession({ children }: { children: ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    setAccessToken(auth.user?.access_token ?? null);
    return () => setAccessToken(null);
  }, [auth.user]);

  let session: Session;
  if (auth.isLoading) {
    session = buildSession({ status: "loading", signInAvailable: true });
  } else if (!auth.isAuthenticated || !auth.user) {
    session = buildSession({
      status: "anonymous",
      signInAvailable: true,
      signIn: () => void auth.signinRedirect(),
      error: auth.error ? "Sign-in could not be completed. Try again." : null,
    });
  } else {
    const record = auth.user.profile as Record<string, unknown>;
    const name =
      typeof record.name === "string"
        ? record.name
        : typeof record.preferred_username === "string"
          ? record.preferred_username
          : "Contributor";
    session = buildSession({
      status: "authenticated",
      name,
      username: typeof record.preferred_username === "string" ? record.preferred_username : null,
      roles: extractRoles(auth.user.profile),
      signInAvailable: true,
      signIn: () => void auth.signinRedirect(),
      signOut: () => void auth.signoutRedirect(),
      error: auth.error ? "The identity provider reported a problem." : null,
    });
  }

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside SessionProvider");
  return session;
}
