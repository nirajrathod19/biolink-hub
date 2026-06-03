import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="w-7 h-7 rounded-lg bg-primary grid place-items-center text-primary-foreground text-sm">B</span>
            Brioo
          </Link>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <Link to="/login" className="hover:text-foreground">Log in</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Brioo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
