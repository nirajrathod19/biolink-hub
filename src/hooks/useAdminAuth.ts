import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "./useUserRole";

const ADMIN_SESSION_KEY = "admin_verified_session";
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export const useAdminAuth = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [isVerified, setIsVerified] = useState(false);
  const queryClient = useQueryClient();

  // Check if admin session is still valid
  useEffect(() => {
    if (user && isAdmin) {
      const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          if (session.user_id === user.id && new Date(session.expires_at) > new Date()) {
            setIsVerified(true);
          } else {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            setIsVerified(false);
          }
        } catch {
          localStorage.removeItem(ADMIN_SESSION_KEY);
          setIsVerified(false);
        }
      }
    }
  }, [user, isAdmin]);

  // Check if password has been set up
  const checkPasswordSetup = useQuery({
    queryKey: ["admin-password-setup"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-magic-link", {
        body: { action: "check_setup" },
      });
      
      if (error) throw error;
      return data as { has_password: boolean };
    },
    enabled: !!user && isAdmin,
  });

  // Set up admin password
  const setupPassword = useMutation({
    mutationFn: async (password: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.functions.invoke("admin-magic-link", {
        body: { action: "setup", user_id: user.id, password },
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-password-setup"] });
    },
  });

  // Verify admin password
  const verifyPassword = useMutation({
    mutationFn: async (password: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.functions.invoke("admin-magic-link", {
        body: { action: "verify", user_id: user.id, password },
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      if (data.verified && user) {
        // Store verified session locally
        const session = {
          user_id: user.id,
          session_token: data.session_token,
          verified_at: new Date().toISOString(),
          expires_at: data.expires_at || new Date(Date.now() + SESSION_DURATION).toISOString(),
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        setIsVerified(true);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-session"] });
    },
  });

  // Clear admin session
  const clearSession = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsVerified(false);
  };

  return {
    isVerified,
    isAdmin,
    hasPassword: checkPasswordSetup.data?.has_password ?? false,
    isCheckingPassword: checkPasswordSetup.isLoading,
    setupPassword,
    verifyPassword,
    clearSession,
  };
};
