import { Menu, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminMobileSidebar } from "./AdminMobileSidebar";

export const AdminMobileHeader = () => {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="flex items-center gap-2 mb-8 pt-2">
        <div className="flex items-center gap-2">
            <img 
              src="/Logo.png" 
              alt="Brioo Mobile" 
              className="w-12 h-8 object-contain" 
            />            
          </div>
            <span className="text-xs text-muted-foreground block -mt-1">Admin</span>
          </div>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
            <AdminMobileSidebar />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
