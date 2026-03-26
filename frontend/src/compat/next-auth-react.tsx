import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SessionUser = {
  id?: string;
  email?: string;
  name?: string;
  image?: string | null;
};

type Session = {
  user?: SessionUser;
};

type AuthContextValue = {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setSession: (session: Session | null) => void;
};

const AUTH_TOKEN_KEY = "feedmind_auth_token";
const AUTH_USER_KEY = "feedmind_auth_user";
const AUTH_CHANGED_EVENT = "feedmind-auth-changed";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

function saveAuth(token: string, user: SessionUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  notifyAuthChanged();
}

function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  notifyAuthChanged();
}

function loadUser(): SessionUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const syncAuthState = () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const user = loadUser();
      if (token && user) {
        setSession({ user });
        setStatus("authenticated");
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    };

    syncAuthState();
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const value = useMemo(() => ({ session, status, setSession }), [session, status]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      data: null,
      status: "unauthenticated" as const,
      update: async () => null,
    };
  }

  return {
    data: ctx.session,
    status: ctx.status,
    update: async () => ctx.session,
  };
}

export async function getProviders() {
  return {
    credentials: { id: "credentials", name: "Email" },
    google: { id: "google", name: "Google" },
  };
}

export async function signIn(provider: string, options?: Record<string, unknown>) {
  const redirect = options?.redirect !== false;
  const callbackUrl = (options?.callbackUrl as string | undefined) ?? "/dashboard";

  if (provider === "credentials") {
    const email = String(options?.email ?? "").trim();
    if (!email) {
      return { error: "Email is required", ok: false, status: 400 };
    }

    const response = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const body = await response.json().catch(() => ({ error: "Login failed" }));

    if (!response.ok || !body?.token || !body?.user) {
      return { error: body?.error ?? "Login failed", ok: false, status: response.status };
    }

    saveAuth(body.token as string, body.user as SessionUser);

    if (redirect) {
      window.location.assign(callbackUrl);
    }

    return { ok: true, status: 200, error: undefined };
  }

  if (provider === "google") {
    return {
      error: "Google sign-in is not available in React mode yet. Use email login.",
      ok: false,
      status: 400,
    };
  }

  return { error: `Unsupported provider: ${provider}`, ok: false, status: 400 };
}

export async function signOut(options?: { redirect?: boolean; callbackUrl?: string }) {
  clearAuth();

  try {
    await fetch(apiUrl("/api/auth/logout"), { method: "POST" });
  } catch {
    // Ignore network errors when local state is already cleared.
  }

  if (options?.redirect !== false) {
    window.location.assign(options?.callbackUrl ?? "/auth");
  }

  return { ok: true };
}
