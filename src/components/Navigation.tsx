import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Navigation = () => {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/dashboard" className="text-xl font-bold text-foreground">
          Ad Proof Manager
        </Link>

        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
};

export default Navigation;
