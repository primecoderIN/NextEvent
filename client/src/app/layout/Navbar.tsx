import { Menu, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-xl items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-6">
          <CalendarDays className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">NextEvent</span>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Events
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Calendar
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </a>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm">
            Login
          </Button>
          <Button size="sm">Sign Up</Button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden ml-auto">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background px-4 py-3 flex flex-col gap-3">
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Events
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Calendar
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </a>
          <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" className="w-full">
              Login
            </Button>
            <Button size="sm" className="w-full">
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
