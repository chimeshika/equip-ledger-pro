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
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Government Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {governmentLinks.map((link, index) => (
              <div key={link.name} className="flex items-center gap-4 md:gap-6">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-secondary-foreground/80 hover:text-accent transition-colors flex items-center gap-1"
                >
                  {link.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
                {index < governmentLinks.length - 1 && (
                  <span className="hidden md:inline text-secondary-foreground/30">|</span>
                )}
              </div>
            ))}
          </nav>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-secondary-foreground/80">
              © {currentYear} Ministry of Public Services
            </p>
            <p className="text-xs text-secondary-foreground/60 mt-0.5">
              All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
