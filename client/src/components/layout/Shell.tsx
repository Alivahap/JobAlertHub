import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Briefcase, 
  Bell, 
  User, 
  LogOut, 
  Menu,
  X,
  Building2,
  ShieldCheck,
  ShoppingBag
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "İlanlar", icon: Briefcase },
    { href: "/products", label: "Ürünler", icon: ShoppingBag },
    { href: "/profile", label: "Profilim", icon: User },
  ];

  if (user?.isAdmin) {
    navItems.push({ href: "/admin", label: "Yönetim", icon: ShieldCheck });
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="p-2 bg-accent rounded-lg text-accent-foreground">
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="font-serif font-bold text-lg leading-tight text-white">Kamu İlan</h1>
          <p className="text-xs text-blue-200">Resmi Takip Sistemi</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                  isActive 
                    ? "bg-white text-primary shadow-lg translate-x-1" 
                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-primary" : "text-blue-300 group-hover:text-white"} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <Avatar className="h-9 w-9 border border-white/20">
            <AvatarFallback className="bg-blue-800 text-blue-100">
              {user?.email?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <p className="text-xs text-blue-300 truncate">Kamu Personeli</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-blue-200 hover:text-white hover:bg-red-500/20 hover:text-red-200"
          onClick={() => logout()}
        >
          <LogOut size={18} className="mr-2" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 bg-primary text-white shadow-2xl fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent rounded text-accent-foreground">
            <Building2 size={20} />
          </div>
          <span className="font-serif font-bold">Kamu İlan</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-primary border-r-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 transition-all duration-300">
        <div className="md:p-8 p-4 pt-20 md:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
