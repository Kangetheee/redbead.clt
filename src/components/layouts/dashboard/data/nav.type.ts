import { Route } from "next";

import { Permission } from "@/lib/roles/types/permission.type";

export type NavIcon =
  | "MdOutlineDashboard"
  | "MdOutlineShoppingCart"
  | "MdOutlinePayments"
  | "MdOutlineLocalOffer"
  | "MdOutlineInventory2"
  | "MdOutlineCategory"
  | "MdOutlinePeople"
  | "MdOutlineStarBorder"
  | "MdOutlineContactSupport"
  | "MdOutlineSupportAgent"
  | "MdOutlineMessage"
  | "MdOutlineCrisisAlert"
  | "MdOutlinePermMedia"
  | "MdOutlineArticle"
  | "MdOutlineDescription"
  | "MdOutlineEmail"
  | "MdOutlineHandshake"
  | "MdOutlineBrandingWatermark"
  | "MdOutlineLocalShipping"
  | "MdOutlineAssessment"
  | "MdOutlineWork"
  | "MdOutlinePrivacyTip"
  | "MdOutlineCookie"
  | "MdOutlineGavel"
  | "MdOutlineBadge"
  | "MdOutlinePeopleAlt"
  | "MdOutlineSettings"
  | "MdChatBubbleOutline"
  | "MdHelpOutline"
  | "MdOutlineSmartToy"
  | "MdOutlineQuestionAnswer"
  | "MdOutlineMailOutline"
  | "MdOutlineAdminPanelSettings"
  | "MdOutlineManageAccounts"
  | "MdOutlineHistoryToggleOff"
  | "MdOutlineFactCheck"
  | "MdOutlinePerson"
  | "LuUnplug"
  | "LuCalendarClock"
  | "MdOutlineAccountBalance";

export type NavSubItem = {
  name: string;
  href: Route;
  permissions: Permission[];
};

export type NavItem = {
  name: string;
  icon: NavIcon;
  href?: Route;
  subitems?: NavSubItem[];
  permissions?: Permission[];
  isIncomplete?: boolean;
};

export type NavGroup = {
  name: string;
  items: NavItem[];
};
