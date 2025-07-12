import { IconType } from "react-icons/lib";

import { cn } from "@/lib/utils";

import { Button } from "../button";

type Props = {
  icon: IconType;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
};

export default function ToolbarButton({
  icon: Icon,
  isActive,
  onClick,
  disabled,
}: Props) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      type="button"
      disabled={disabled}
      variant={isActive ? "outline" : "ghost"}
      className={cn("text-sm hover:bg-background/80")}
    >
      <Icon className="sie-4" />
    </Button>
  );
}
