import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileHeader } from "./MobileHeader";
import { DashboardAmbient } from "./DashboardAmbient";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient cinematic background */}
      <DashboardAmbient />

      {/* Mobile Header with Hamburger Menu */}
      <MobileHeader />

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <main className="relative lg:ml-64 transition-all duration-300 pt-14 lg:pt-0 pb-24 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};
