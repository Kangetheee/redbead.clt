import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { HTMLAttributes, useState } from "react";

import { ChevronDown } from "lucide-react";
import { IconType } from "react-icons/lib";
import { LuCalendarClock, LuUnplug } from "react-icons/lu";
import {
  MdChatBubbleOutline,
  MdHelpOutline,
  MdOutlineAdminPanelSettings,
  MdOutlineArticle,
  MdOutlineAssessment,
  MdOutlineBadge,
  MdOutlineBrandingWatermark,
  MdOutlineCategory,
  MdOutlineContactSupport,
  MdOutlineCookie,
  MdOutlineCrisisAlert,
  MdOutlineDashboard,
  MdOutlineDescription,
  MdOutlineEmail,
  MdOutlineFactCheck,
  MdOutlineGavel,
  MdOutlineHandshake,
  MdOutlineHistoryToggleOff,
  MdOutlineInventory2,
  MdOutlineLocalOffer,
  MdOutlineLocalShipping,
  MdOutlineMailOutline,
  MdOutlineManageAccounts,
  MdOutlineMessage,
  MdOutlinePayments,
  MdOutlinePeople,
  MdOutlinePeopleAlt,
  MdOutlinePermMedia,
  MdOutlinePerson,
  MdOutlinePrivacyTip,
  MdOutlineQuestionAnswer,
  MdOutlineSettings,
  MdOutlineShoppingCart,
  MdOutlineSmartToy,
  MdOutlineStarBorder,
  MdOutlineSupportAgent,
  MdOutlineWork,
  MdOutlineAccountBalance,
} from "react-icons/md";

import Collapse from "@/components/ui/collapse";
import { cn } from "@/lib/utils";

import { NavIcon, NavItem as NavItemType } from "./data/nav.type";

const IconObject: Record<NavIcon, IconType> = {
  MdOutlineDashboard,
  MdOutlineShoppingCart,
  MdOutlineInventory2,
  MdOutlineCategory,
  MdOutlinePeople,
  MdOutlineStarBorder,
  MdOutlineContactSupport,
  MdOutlineSupportAgent,
  MdOutlineMessage,
  MdOutlineCrisisAlert,
  MdOutlinePermMedia,
  MdOutlineArticle,
  MdOutlineLocalOffer,
  MdOutlineEmail,
  MdOutlineHandshake,
  MdOutlineBrandingWatermark,
  MdOutlineLocalShipping,
  MdOutlineAssessment,
  MdOutlineWork,
  MdOutlineQuestionAnswer,
  MdOutlinePrivacyTip,
  MdOutlineCookie,
  MdOutlineGavel,
  MdOutlineDescription,
  MdOutlineBadge,
  MdOutlinePeopleAlt,
  MdOutlineSettings,
  MdChatBubbleOutline,
  MdHelpOutline,
  MdOutlineSmartToy,
  MdOutlineMailOutline,
  MdOutlinePayments,
  MdOutlineAdminPanelSettings,
  MdOutlineManageAccounts,
  MdOutlineHistoryToggleOff,
  MdOutlineFactCheck,
  MdOutlinePerson,
  MdOutlineAccountBalance,
  LuUnplug,
  LuCalendarClock,
} as const;

type Props = {
  onClose?: () => void;
  navItem: NavItemType;
};

export default function NavItem({ navItem, onClose }: Props) {
  const { name, icon, href, subitems } = navItem;
  const Icon = IconObject[icon];

  const [isOpen, setIsOpen] = useState(false);
  const onToggle = () => setIsOpen((state) => !state);
  const params = useParams();
  const pathname = usePathname();
  const link =
    !subitems && href ? (params.id ? `${href}/${params.id}` : href) : undefined;
  const isActive = link
    ? pathname === link
    : subitems && subitems.length > 0
      ? subitems?.some((subitem) => pathname.startsWith(subitem.href))
      : false;

  const titleClassName: HTMLAttributes<HTMLDivElement>["className"] = cn(
    "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    "hover:bg-muted/80 hover:text-primary active:bg-muted text-secondary-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    isActive &&
      "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
  );

  return (
    <button
      className="w-full"
      onClick={subitems && subitems.length > 0 ? onToggle : undefined}
      type="button"
      tabIndex={subitems && subitems.length > 0 ? 0 : undefined}
    >
      {!subitems && href ? (
        <Link
          href={href}
          className={titleClassName}
          onClick={() => onClose?.()}
        >
          <Icon className="mr-2 size-4 transition-colors" />
          <span className="truncate">{name}</span>
        </Link>
      ) : (
        <div className={titleClassName}>
          <Icon className="mr-2 size-4 transition-colors" />
          <span className="truncate">{name}</span>
          {subitems && subitems.length > 0 && (
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          )}
        </div>
      )}

      <Collapse in={isOpen} animateOpacity style={{ marginTop: 0 }}>
        <div className="relative mt-1 space-y-1 px-6">
          {/* Vertical line connector */}
          <div className="absolute bottom-4 left-3 top-0 w-px bg-muted-foreground/20" />

          {subitems?.map((item) => (
            <Link
              className={cn(
                "flex items-center gap-2 rounded-md py-2 pl-0 text-sm text-muted-foreground transition-colors",
                "hover:text-primary",
                pathname === item.href && "font-medium text-primary"
              )}
              href={item.href}
              key={item.name}
              onClick={() => onClose?.()}
            >
              <div
                className={cn(
                  "relative h-1.5 w-1.5 rounded-full bg-muted-foreground/60",
                  pathname === item.href && "bg-primary"
                )}
              />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </Collapse>
    </button>
  );
}
