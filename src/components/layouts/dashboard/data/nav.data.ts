import { NavGroup } from "./nav.type";

export const navGroups: NavGroup[] = [
  {
    name: "Overview",
    items: [
      {
        name: "Dashboard",
        icon: "MdOutlineDashboard",
        href: "/",
        permissions: ["*"],
      },
    ],
  },
  {
    name: "Clients",
    items: [
      {
        name: "Clients",
        icon: "MdOutlinePerson",
        href: "/clients",
        permissions: ["Client:read"],
      },
      {
        name: "Interactions",
        icon: "LuCalendarClock",
        href: "/interactions",
        permissions: ["Interaction:read"],
      },
    ],
  },
  // {
  //   name: "Bots",
  //   items: [
  //     {
  //       name: "Bots",
  //       icon: "MdOutlineSmartToy",
  //       href: "/bots",
  //       permissions: ["Bot:read"],
  //       isIncomplete: true,
  //     },
  //   ],
  // },
  {
    name: "Conversations",
    items: [
      // {
      //   name: "Questions",
      //   icon: "MdOutlineMailOutline",
      //   isIncomplete: true,
      //   subitems: [
      //     {
      //       name: "All Questions",
      //       href: "/questions",
      //       permissions: ["Question:read"],
      //     },
      //     {
      //       name: "Add Questions",
      //       href: "/questions/create",
      //       permissions: ["Question:create"],
      //     },
      //   ],
      // },
      {
        name: "Conversations",
        icon: "MdOutlineQuestionAnswer",
        href: "/conversations",
        permissions: ["Conversation:read"],
      },
    ],
  },
  {
    name: "Insurance",
    items: [
      {
        name: "Underwriters",
        icon: "MdOutlineAccountBalance",
        href: "/insurance/underwriters",
        permissions: ["Underwriter:read"],
      },
      {
        name: "Insurance Types",
        icon: "MdOutlineCategory",
        href: "/insurance/insurance-types",
        permissions: ["InsuranceType:read"],
      },
      {
        name: "Insurance Plans",
        icon: "MdOutlineDescription",
        href: "/insurance/insurance-plans",
        permissions: ["InsurancePlan:read"],
      },
    ],
  },
  {
    name: "Integrations",
    items: [
      {
        name: "Channels",
        icon: "LuUnplug",
        href: "/channels",
        permissions: ["Channel:read"],
      },
    ],
  },
  {
    name: "Administration",
    items: [
      {
        name: "Roles",
        icon: "MdOutlineAdminPanelSettings",
        href: "/settings/roles",
        permissions: ["Role:read"],
      },
      {
        name: "Admin Users",
        icon: "MdOutlineManageAccounts",
        href: "/settings/users",
        permissions: ["User:read"],
      },
      {
        name: "Activity Logs",
        icon: "MdOutlineHistoryToggleOff",
        href: "/settings/activity-logs",
        permissions: ["ActivityLog:read"],
      },
      {
        name: "Audit Logs",
        icon: "MdOutlineFactCheck",
        href: "/settings/audit-logs",
        permissions: ["AuditTrail:read"],
      },
    ],
  },
  {
    name: "Legal",
    items: [
      {
        name: "Privacy Policy",
        icon: "MdOutlinePrivacyTip",
        href: "/privacy",
        permissions: ["Legal:read"],
      },
      {
        name: "Terms of Service",
        icon: "MdOutlineGavel",
        href: "/terms",
        permissions: ["Legal:read"],
      },
    ],
  },
  {
    name: "FAQ",
    items: [
      {
        name: "Enquiries",
        icon: "MdOutlineContactSupport",
        href: "/enquiries",
        permissions: ["WebsiteEnquiry:read"],
      },
      {
        name: "Manage FAQs",
        icon: "MdOutlineQuestionAnswer",
        href: "/faqs",
        permissions: ["Faq:read"],
      },
    ],
  },
];
