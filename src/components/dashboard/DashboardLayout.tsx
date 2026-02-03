import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileHeader } from "./MobileHeader";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Hamburger Menu */}
      <MobileHeader />
      
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      
      {/* Main Content */}
      <main className="lg:ml-64 transition-all duration-300 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
