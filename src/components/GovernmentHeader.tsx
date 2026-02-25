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
            <h1 className="text-lg font-semibold text-foreground leading-tight md:text-3xl"> Equipment Manegment System                                                                                    

            </h1>
            <p className="text-muted-foreground mt-1 text-base">   Home Affairs Section  | Minstry of Public Service, Provincial Councils and Local Government

            </p>
          </div>
        </div>
      </div>
    </div>);

};