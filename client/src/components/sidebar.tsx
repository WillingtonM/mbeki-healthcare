import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { id: "dashboard", path: "/", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { id: "registration", path: "/registration", label: "Patient Registration", icon: "fas fa-user-plus" },
    { id: "lookup", path: "/lookup", label: "Patient Lookup", icon: "fas fa-search" },
    { id: "consent", path: "/consent", label: "Consent Forms", icon: "fas fa-file-signature" },
    { id: "visits", path: "/visits", label: "Visit Tracking", icon: "fas fa-calendar-check" },
    { id: "reports", path: "/reports", label: "Reports", icon: "fas fa-chart-bar" },
    { id: "settings", path: "/settings", label: "Settings", icon: "fas fa-cog" },
  ];

  return (
    <div className="w-64 bg-card shadow-lg border-r border-border mt-16">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Navigation</h2>
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => setLocation(item.path)}
              className={`w-full flex items-center justify-start px-4 py-3 rounded-lg transition-colors ${
                location === item.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-foreground"
              }`}
              variant="ghost"
              data-testid={`nav-${item.id}`}
            >
              <i className={`${item.icon} mr-3`}></i>
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}
