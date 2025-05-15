import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BellIcon } from "lucide-react";

interface HeaderProps {
  user: {
    displayInitials: string;
  };
}

const Header = ({ user }: HeaderProps) => {
  return (
    <header className="px-4 py-3 sm:py-4 bg-white border-b border-neutral-200 fixed top-0 left-0 right-0 z-10">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl font-semibold font-poppins text-neutral-800">
            <span className="text-primary">Vocab</span><span className="text-secondary">Vision</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="p-2 rounded-full hover:bg-neutral-100" aria-label="Notifications">
            <BellIcon className="h-5 w-5 text-neutral-600" />
          </Button>
          <Avatar className="w-8 h-8 bg-primary text-white">
            <AvatarFallback className="font-medium text-sm">
              {user.displayInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
