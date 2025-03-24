import { Sun, Moon, Menu, X } from "lucide-react";
import { FC } from "react";

interface DynamicIconProps {
  icon: "sun" | "moon" | "menu" | "x";
}

const DynamicIcon: FC<DynamicIconProps> = ({ icon }) => {
  switch (icon) {
    case "sun":
      return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    case "moon":
      return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    case "menu":
      return <Menu className="h-[1.2rem] w-[1.2rem]" />;
    case "x":
      return <X className="h-[1.2rem] w-[1.2rem]" />;
    default:
      return null;
  }
};

export default DynamicIcon;
