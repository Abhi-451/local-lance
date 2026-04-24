import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const navLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/influencers", label: "Discover" },
        ...(user?.role === "business" ? [{ href: "/campaigns", label: "Campaigns" }] : []),
        { href: "/requests", label: "Requests" },
        { href: "/messages", label: "Messages" },
      ]
    : [];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-primary tracking-tight">Localfluence</span>
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors hover:text-foreground ${
                      location.startsWith(link.href) ? "text-foreground font-semibold" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer w-full">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-serif text-xl font-bold text-primary">Localfluence</span>
                </div>
                
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-6">
                    <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-muted/50">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={user?.avatarUrl || ""} />
                        <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                      </div>
                    </div>
                    
                    <nav className="flex flex-col space-y-3">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMenu}
                          className={`px-2 py-2 text-lg font-medium rounded-md transition-colors ${
                            location.startsWith(link.href) ? "bg-primary/10 text-primary" : "hover:bg-muted"
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    
                    <div className="mt-auto pt-6 border-t border-border flex flex-col space-y-3">
                      <Link href="/profile" onClick={closeMenu} className="px-2 py-2 text-lg font-medium hover:bg-muted rounded-md">
                        Profile
                      </Link>
                      <button 
                        onClick={() => { closeMenu(); logout(); }} 
                        className="px-2 py-2 text-lg font-medium text-destructive hover:bg-destructive/10 rounded-md text-left"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4 mt-4">
                    <Button variant="outline" asChild className="w-full justify-start text-lg h-12" onClick={closeMenu}>
                      <Link href="/login">Log in</Link>
                    </Button>
                    <Button asChild className="w-full justify-start text-lg h-12" onClick={closeMenu}>
                      <Link href="/signup">Sign up</Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t border-border py-8 mt-auto bg-card">
        <div className="container mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Localfluence. Connecting neighborhoods.</p>
        </div>
      </footer>
    </div>
  );
}
