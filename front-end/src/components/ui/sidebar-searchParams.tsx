"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    title: string;
  }[];
}

export function SidebarSearchParamsNav({
  className,
  items,
  ...props
}: SidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  let selectedBuilding: string | null = "All";
  if (searchParams && searchParams.has("building")) {
    selectedBuilding = searchParams.get("building");
  }

  const handleSetSelectedBuilding = useCallback(
    (building: string, name: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(building, name);

      return params.toString();
    },
    [searchParams],
  );

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.title}
          prefetch={false}
          href={
            pathname + "?" + handleSetSelectedBuilding("building", item.title)
          }
          className={cn(
            buttonVariants({ variant: "ghost" }),
            selectedBuilding === item.title
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
