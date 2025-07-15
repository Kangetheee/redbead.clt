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
    name: "Products",
    items: [
      {
        name: "Products",
        icon: "MdOutlineInventory2",
        href: "/products",
        permissions: ["Product:read"],
      },
      {
        name: "Categories",
        icon: "MdOutlineCategory",
        href: "/categories",
        permissions: ["Category:read"],
      },
      {
        name: "Customization",
        icon: "MdOutlineSettings",
        subitems: [
          {
            name: "Options",
            href: "/customization/options",
            permissions: ["CustomizationOption:read"],
          },
          {
            name: "Values",
            href: "/customization/values",
            permissions: ["CustomizationOptionValue:read"],
          },
        ],
      },
    ],
  },
  {
    name: "Orders",
    items: [
      {
        name: "Orders",
        icon: "MdOutlineShoppingCart",
        href: "/orders",
        permissions: ["Order:read"],
      },
      {
        name: "Bulk Orders",
        icon: "MdOutlineWork",
        href: "/bulk-orders",
        permissions: ["BulkOrder:read"],
      },
      {
        name: "Cart Management",
        icon: "MdOutlineLocalOffer",
        href: "/carts",
        permissions: ["Cart:read"],
      },
    ],
  },
  {
    name: "Design Studio",
    items: [
      {
        name: "Designs",
        icon: "MdOutlineBrandingWatermark",
        href: "/designs",
        permissions: ["Design:read"],
      },
      {
        name: "Templates",
        icon: "MdOutlineDescription",
        href: "/design-templates",
        permissions: ["DesignTemplate:read"],
      },
      {
        name: "Approvals",
        icon: "MdOutlineFactCheck",
        href: "/design-approvals",
        permissions: ["DesignApproval:read"],
      },
      {
        name: "Assets",
        icon: "MdOutlinePermMedia",
        href: "/design-assets",
        permissions: ["DesignAsset:read"],
      },
    ],
  },
  {
    name: "Customers",
    items: [
      {
        name: "Customers",
        icon: "MdOutlinePeople",
        href: "/customers",
        permissions: ["Customer:read"],
      },
      {
        name: "Customer Tags",
        icon: "MdOutlineBadge",
        href: "/customer-tags",
        permissions: ["CustomerTag:read"],
      },
      {
        name: "Addresses",
        icon: "MdOutlineLocalShipping",
        href: "/addresses",
        permissions: ["Address:read"],
      },
    ],
  },
  {
    name: "Payments & Shipping",
    items: [
      {
        name: "Payments",
        icon: "MdOutlinePayments",
        href: "/payments",
        permissions: ["Payment:read"],
      },
      {
        name: "Shipping Zones",
        icon: "MdOutlineLocalShipping",
        href: "/shipping/zones",
        permissions: ["ShippingZone:read"],
      },
      {
        name: "Shipping Rates",
        icon: "MdOutlineAssessment",
        href: "/shipping/rates",
        permissions: ["ShippingRate:read"],
      },
    ],
  },
  {
    name: "Media",
    items: [
      {
        name: "Media Library",
        icon: "MdOutlinePermMedia",
        href: "/media",
        permissions: ["Media:read"],
      },
      {
        name: "Uploads",
        icon: "MdOutlineArticle",
        href: "/uploads",
        permissions: ["Upload:read"],
      },
    ],
  },
  {
    name: "Communications",
    items: [
      {
        name: "Email Templates",
        icon: "MdOutlineEmail",
        href: "/email-templates",
        permissions: ["EmailTemplate:read"],
      },
      {
        name: "Email Logs",
        icon: "MdOutlineMailOutline",
        href: "/email-logs",
        permissions: ["EmailLog:read"],
      },
      {
        name: "Notifications",
        icon: "MdOutlineMessage",
        subitems: [
          {
            name: "Templates",
            href: "/notifications/templates",
            permissions: ["NotificationTemplate:read"],
          },
          {
            name: "Preferences",
            href: "/notifications/preferences",
            permissions: ["NotificationPreference:read"],
          },
        ],
      },
    ],
  },
  {
    name: "Analytics",
    items: [
      {
        name: "Metrics",
        icon: "MdOutlineAssessment",
        href: "/analytics/metrics",
        permissions: ["Metric:read"],
      },
      {
        name: "Patterns",
        icon: "MdOutlineStarBorder",
        href: "/analytics/patterns",
        permissions: ["Pattern:read"],
      },
      {
        name: "Behavior",
        icon: "MdOutlinePeopleAlt",
        href: "/analytics/behavior",
        permissions: ["BehaviorPattern:read"],
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
        name: "Users",
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
        name: "Audit Trails",
        icon: "MdOutlineFactCheck",
        href: "/settings/audit-trails",
        permissions: ["AuditTrail:read"],
      },
    ],
  },
];
