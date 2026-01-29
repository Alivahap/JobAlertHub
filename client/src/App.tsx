import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import HomePage from "@/pages/home-page";
import ProductsPage from "@/pages/products-page";
import ProfilePage from "@/pages/profile-page";
import AdminPage from "@/pages/admin-page";
import NotFound from "@/pages/not-found";

// Wrapper for protected routes
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If user has no professions, force onboarding (unless they are already there, but this component wraps others)
  if (!user.professions || user.professions.length === 0) {
    return <Redirect to="/onboarding" />;
  }

  // Redirect if they have professions but are trying to go to onboarding
  if (window.location.pathname === "/onboarding" && user.professions && user.professions.length > 0) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

// Special check for onboarding to avoid loops
function OnboardingRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Redirect to="/auth" />;
  
  if (user.professions && user.professions.length > 0) {
    return <Redirect to="/" />;
  }
  
  return <OnboardingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={OnboardingRoute} />
      
      <Route path="/">
        <ProtectedRoute component={HomePage} />
      </Route>

      <Route path="/products">
        <ProtectedRoute component={ProductsPage} />
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute component={ProfilePage} />
      </Route>

      <Route path="/admin">
        <ProtectedRoute component={AdminPage} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
