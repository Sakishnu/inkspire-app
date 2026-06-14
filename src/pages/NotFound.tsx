import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Feather, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center transition-colors duration-300">
      <div className="max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Feather className="h-12 w-12 text-primary rotate-12 mb-4 animate-bounce" />
          <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
          <h2 className="text-2xl font-bold">Page Not Found</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            The link you followed may be broken, or the page may have been removed. Let's get you back on track.
          </p>
        </div>

        <div className="pt-4">
          <Button asChild className="rounded-full px-6 font-semibold">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to Explore</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
