import { ExternalLink } from "lucide-react";

const governmentLinks = [
  { name: "Gov.lk", url: "https://www.gov.lk" },
  { name: "Ministry Website", url: "https://moha.gov.lk" },
  { name: "Provincial Councils", url: "https://www.gov.lk/provincial-councils" },
  { name: "Contact Us", url: "mailto:it.branch@moha.gov.lk" },
];

export const GovernmentFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Government Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {governmentLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                {link.name}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Ministry of Public Services, Provincial Councils and Local Government
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Home Affairs Section – IT Branch | All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
