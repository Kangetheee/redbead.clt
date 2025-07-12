// import { Permission } from "@/data/modules";
import { Permission } from "@/lib/roles/types/permission.type";

import { NavGroup, NavItem } from "./data/nav.type";

function filterNavItemsByPermissions(
  items: NavItem[],
  checkPermissions: (permissions: Permission[]) => boolean
): NavItem[] {
  return items
    ?.filter((item) => {
      // Allow if permission is "*"
      if (item.permissions && item.permissions.includes("*")) return true;

      // Check main item permissions
      if (item.permissions && !checkPermissions(item.permissions)) return false;

      // If it has subitems, check if at least one subitem is accessible
      if (item.subitems) {
        const accessibleSubitems = item.subitems.filter(
          (subitem) =>
            !subitem.permissions ||
            subitem.permissions.includes("*") ||
            checkPermissions(subitem.permissions)
        );
        return accessibleSubitems.length > 0;
      }

      return true;
    })
    .map((item) => ({
      ...item,
      // Filter subitems if they exist
      subitems: item.subitems?.filter(
        (subitem) =>
          !subitem.permissions ||
          subitem.permissions.includes("*") ||
          checkPermissions(subitem.permissions)
      ),
    }));
}

export default function filterNavGroups(
  navGroups: NavGroup[],
  checkPermissions: (permissions: Permission[]) => boolean
): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: filterNavItemsByPermissions(group.items, checkPermissions),
    }))
    .filter((group) => group.items.length > 0);
}
