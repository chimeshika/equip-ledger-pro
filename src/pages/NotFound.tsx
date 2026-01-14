import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { GovernmentHeader } from "@/components/GovernmentHeader";
import { GovernmentFooter } from "@/components/GovernmentFooter";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovernmentHeader />
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
          <Button asChild>
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
      <GovernmentFooter />
    </div>
  );
};

export default NotFound;
