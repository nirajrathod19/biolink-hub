import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";

interface AdminRouteProps {
  children: React.ReactNode;
}

const ADMIN_SESSION_KEY = "admin_verified_session";

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // Check admin verification status
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
      } else {
        setIsVerified(false);
      }
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!authLoading && !roleLoading && user && !isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Redirect to verification if admin but not verified
    if (!authLoading && !roleLoading && user && isAdmin && isVerified === false) {
      navigate("/admin/verify", { replace: true });
    }
  }, [user, authLoading, isAdmin, roleLoading, isVerified, navigate]);

  if (authLoading || roleLoading || isVerified === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin || !isVerified) {
    return null;
  }

  return <>{children}</>;
};
