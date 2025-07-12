"use client";

import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";

import { NavGroup } from "./data/nav.type";
import NavItem from "./nav-item";
import ThemeToggle from "./theme-toggle";

interface Props {
  className?: React.HTMLAttributes<HTMLElement>["className"];
  onClose?: () => void;
  navGroups: NavGroup[];
}

export default function MainMenu({ className, onClose, navGroups }: Props) {
  return (
    <aside
      className={cn(
        "transition-width fixed left-0 top-0 z-50 h-full overflow-hidden border-r bg-gradient-to-b from-background to-muted/50 duration-300 ease-out md:w-72",
        className
      )}
    >
      <div className="flex h-full max-h-screen flex-col">
        <div className="relative flex h-16 shrink-0 items-center px-6 py-6">
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold"
            onClick={() => onClose?.()}
          >
            <img src="/logo.png" alt="Mama Bima" className="h-6 w-6" />
            Mama Bima
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
          <div className="space-y-1 px-4 pt-4">
            <nav className="grid items-start gap-6">
              {navGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="grid gap-1">
                  <div className="mb-2 ml-2 flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.name}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/20 to-transparent" />
                  </div>
                  <div className="space-y-1">
                    {group.items.map((nav) => (
                      <NavItem
                        key={nav.name}
                        // icon={<Icon className="mr-2 size-4 transition-colors" />}
                        onClose={onClose}
                        // {...rest}
                        navItem={nav}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className="relative shrink-0 px-4 pb-4">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
