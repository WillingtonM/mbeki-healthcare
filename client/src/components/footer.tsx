import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-4 px-6 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Mbeki Healthcare Patient Management System</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Developed & Owned by</span>
          <a
            href="https://www.champsafrica.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors"
            data-testid="link-champs-group"
          >
            Champs Group
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}