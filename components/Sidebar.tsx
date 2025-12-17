"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // ===============================
  // 🔹 SUBSECTION AUTO-OPEN LOGIC
  // ===============================
  const shouldSubsectionBeOpen = pathname.startsWith("/physics/measurements");
  const [sectionOpen, setSectionOpen] = useState(shouldSubsectionBeOpen);

  useEffect(() => {
    setSectionOpen(shouldSubsectionBeOpen);
  }, [shouldSubsectionBeOpen]);

  // ===============================
  // 🔹 SIDEBAR TOGGLE STATE
  // ===============================
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <aside
      className={`
        relative
        h-screen
        bg-slate-900
        text-white
        transition-[width]
        duration-300
        ease-in-out
        ${sidebarOpen ? "w-64" : "w-14"}
      `}
    >
      {/* ===============================
          🔹 CHATGPT-STYLE TOGGLE HANDLE
          =============================== */}
      <div
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="
          absolute
          right-0
          top-0
          h-full
          w-4
          cursor-pointer
          bg-slate-900
          hover:bg-slate-800
          flex
          items-center
          justify-center
          transition-colors
        "
        aria-label="Toggle sidebar"
      >
        <ChevronLeft
          size={16}
          className={`transition-transform duration-300 ${
            sidebarOpen ? "" : "rotate-180"
          }`}
        />
      </div>

      {/* ===============================
          🔹 SIDEBAR CONTENT
          =============================== */}
      <div
        className={`
          h-full
          overflow-hidden
          transition-opacity
          duration-200
          ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        <Link
          href="/"
          className="block p-4 text-lg font-bold hover:underline"
        >
          GCE A Level Physics
        </Link>

        <nav className="px-4 text-sm">
          {/* Measurements Section */}
          <button
            onClick={() => setSectionOpen(!sectionOpen)}
            className="flex w-full items-center gap-2 font-semibold hover:underline"
          >
            <ChevronRight
              size={16}
              className={`transition-transform duration-300 ${
                sectionOpen ? "rotate-90" : ""
              }`}
            />
            <Link
              href="/physics/measurements/learning_outcomes"
              className="flex-1 text-left"
            >
              1. Quantities and Measurements
            </Link>
          </button>

          {/* Subsections */}
          <div
            className={`ml-6 overflow-hidden transition-all duration-300 ${
              sectionOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <SidebarLink
              href="/physics/measurements/physical_quantities_prefixes"
              active={pathname.includes("physical_quantities_prefixes")}
            >
              1.1 Physical Quantities and Prefixes
            </SidebarLink>

            <SidebarLink
              href="/physics/measurements/errors_and_uncertainties"
              active={pathname.includes("errors_and_uncertainties")}
            >
              1.2 Errors and Uncertainties
            </SidebarLink>

            <SidebarLink
              href="/physics/measurements/scalar_and_vector"
              active={pathname.includes("scalar_and_vector")}
            >
              1.3 Scalar and Vector Quantities
            </SidebarLink>
          </div>
        </nav>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`block mt-2 hover:underline ${
        active ? "font-semibold text-white" : "text-slate-300"
      }`}
    >
      {children}
    </Link>
  );
}
