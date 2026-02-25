import governmentLogo from "@/assets/sri-lanka-logo.png";

interface GovernmentHeaderProps {
  className?: string;
}

export const GovernmentHeader = ({ className = "" }: GovernmentHeaderProps) => {
  return (
    <div className={`bg-card border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <img
            src={governmentLogo}
            alt="Sri Lanka Government Logo"
            className="h-16 md:h-20 w-auto" />

          <div className="border-l-0 md:border-l-2 border-accent pl-0 md:pl-4">
            <h1 className="text-lg md:text-xl font-semibold text-foreground leading-tight">
              Ministry of Public Services, Provincial Councils and Local Government
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Home Affairs Section  | Equipment Management System 

            </p>
          </div>
        </div>
      </div>
    </div>);

};