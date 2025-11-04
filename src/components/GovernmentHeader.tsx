import governmentLogo from "@/assets/sri-lanka-logo.png";

interface GovernmentHeaderProps {
  className?: string;
}

export const GovernmentHeader = ({ className = "" }: GovernmentHeaderProps) => {
  return (
    <div className={`bg-card border-b ${className}`}>
      <div className="container mx-auto px-4 py-6 text-center">
        <img 
          src={governmentLogo} 
          alt="Sri Lanka Government Logo" 
          className="h-24 w-auto mx-auto mb-4"
        />
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Ministry of Public Services, Provincial Councils and Local Government
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Home Affairs Section – IT Branch (2025)
        </p>
      </div>
    </div>
  );
};
