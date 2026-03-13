import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUsernameCheck = (username: string) => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!username || username.length < 3) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const { data, error } = await supabase.rpc("check_username_available", {
          desired_username: username,
        });

        if (error) {
          console.error("Username check error:", error);
          setIsAvailable(null);
        } else {
          setIsAvailable(data as boolean);
        }
      } catch {
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username]);

  return { isAvailable, isChecking };
};
