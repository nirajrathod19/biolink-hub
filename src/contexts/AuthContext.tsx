import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const LAST_ACTIVE_KEY = "brioo_last_active";
const INACTIVITY_LIMIT_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Inactivity tracker ──
  const updateLastActive = useCallback(() => {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
  }, []);

  // Check if the user has been inactive for more than 3 days
  const checkInactivity = useCallback(async () => {
    const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
    if (lastActive) {
      const elapsed = Date.now() - parseInt(lastActive, 10);
      if (elapsed > INACTIVITY_LIMIT_MS) {
        // Auto-logout: session expired due to inactivity
        localStorage.removeItem(LAST_ACTIVE_KEY);
        await supabase.auth.signOut();
        return true;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          updateLastActive();
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const inactive = await checkInactivity();
        if (inactive) {
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        updateLastActive();
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [updateLastActive, checkInactivity]);

  // Update last-active timestamp on user interactions
  useEffect(() => {
    if (!user) return;

    const events = ["click", "keydown", "scroll", "touchstart"];
    // Throttle: update at most every 60 seconds
    let lastUpdate = Date.now();
    const handler = () => {
      if (Date.now() - lastUpdate > 60_000) {
        lastUpdate = Date.now();
        updateLastActive();
      }
    };

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, handler));
  }, [user, updateLastActive]);

  const signUp = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};