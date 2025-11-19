import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Dashboard from "@/pages/dashboard";
import PatientRegistration from "@/pages/patient-registration";
import PatientLookup from "@/pages/patient-lookup";
import ConsentForms from "@/pages/consent-forms";
import VisitTracking from "@/pages/visit-tracking";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/registration" component={PatientRegistration} />
      <Route path="/lookup" component={PatientLookup} />
      <Route path="/consent" component={ConsentForms} />
      <Route path="/visits" component={VisitTracking} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={() => {
          // The auth context will handle the state update
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-background flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Router />
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AuthenticatedApp />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
