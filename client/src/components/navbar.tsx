import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-hospital text-primary-foreground text-2xl mr-3" data-testid="icon-hospital"></i>
              <h1 className="text-xl font-bold text-primary-foreground">Mbeki Healthcare</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-primary-foreground text-sm">
              <i className="fas fa-user-md mr-2" data-testid="icon-user"></i>
              <span data-testid="text-current-user">{user?.username || 'Admin'}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary-foreground hover:text-secondary transition-colors"
              onClick={handleLogout}
              data-testid="button-logout"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
