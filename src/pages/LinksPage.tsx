import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileBuilder } from "@/features/profile-builder";

/**
 * LinksPage — Profile Builder v2.
 *
 * The previous link editor with inline scheduling, lock-types and animation
 * selectors has been streamlined into the new ProfileBuilder feature
 * (src/features/profile-builder). Advanced per-link controls (scheduling,
 * locks, animations) are temporarily collapsed under Advanced and will be
 * re-surfaced from the new editor in a follow-up pass.
 */
const LinksPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  return (
    <DashboardLayout>
      <ProfileBuilder />
    </DashboardLayout>
  );
};

export default LinksPage;
