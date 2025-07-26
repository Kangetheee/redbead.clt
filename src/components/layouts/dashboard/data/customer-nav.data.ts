import {
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  Paintbrush2,
  MapPin,
} from "lucide-react";

export const customerNavItems = [
  { href: "/dashboard/customer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/customer/orders", label: "Orders", icon: PackageSearch },
  { href: "/dashboard/customer/cart", label: "Cart", icon: ShoppingCart },
  {
    href: "/dashboard/customer/checkout",
    label: "Checkout",
    icon: ShoppingCart,
  },
  {
    href: "/dashboard/customer/design-studio",
    label: "Design Studio",
    icon: Paintbrush2,
  },
  { href: "/dashboard/customer/addresses", label: "Addresses", icon: MapPin },
];
