"use client";

import Link from "next/link";
import { ReactNode } from "react";

type SidebarLinkProps = {
  href: string;
  active: boolean;
  children: ReactNode;
};

export default function SidebarLink({
  href,
  active,
  children,
}: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`
        block
        mt-2
        pl-2
        border-l
        transition-colors
        hover:underline
        ${
          active
            ? "border-white text-white font-semibold"
            : "border-transparent text-slate-300 hover:text-white"
        }
      `}
    >
      {children}
    </Link>
  );
}
