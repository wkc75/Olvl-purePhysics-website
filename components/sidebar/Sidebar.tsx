"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import SidebarLink from "./SidebarLink";
import { sidebarChapters } from "./sidebarData";

export default function Sidebar() {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openChapterId, setOpenChapterId] = useState<string | null>(null);

  useEffect(() => {
    const match = sidebarChapters.find((c) =>
      pathname.startsWith(c.basePath)
    );
    setOpenChapterId(match ? match.id : null);
  }, [pathname]);

  function toggleChapter(chapterId: string) {
    setOpenChapterId((current) =>
      current === chapterId ? null : chapterId
    );
  }

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
      <div
        onClick={() => setSidebarOpen((prev) => !prev)}
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
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ")
            setSidebarOpen((p) => !p);
        }}
      >
        <ChevronLeft
          size={16}
          className={`transition-transform duration-300 ${
            sidebarOpen ? "" : "rotate-180"
          }`}
        />
      </div>

      <div
        className={`
          h-full
          overflow-hidden
          transition-opacity
          duration-200
          ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        <Link href="/" className="block p-4 text-lg font-bold hover:underline">
          GCE A Level Physics
        </Link>

        <nav className="px-4 space-y-2 text-sm">
          {sidebarChapters.map((chapter) => {
            const isOpen = openChapterId === chapter.id;

            return (
              <div key={chapter.id} className="select-none">
                <div className="flex items-center gap-2 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter.id)}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded
                      p-1
                      hover:bg-slate-800
                      transition-colors
                    "
                    aria-label={
                      isOpen
                        ? `Collapse ${chapter.title}`
                        : `Expand ${chapter.title}`
                    }
                    aria-expanded={isOpen}
                  >
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  <Link
                    href={chapter.landingPath || chapter.basePath}
                    className="flex-1 hover:underline"
                  >
                    {chapter.title}
                  </Link>
                </div>

                <div
                  className={`
                    ml-6
                    grid
                    transition-[grid-template-rows]
                    duration-300
                    ease-in-out
                    ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
                  `}
                >
                  <div
                    className={`
                      min-h-0
                      overflow-hidden
                      transition-all
                      duration-300
                      ease-out
                      ${
                        isOpen
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 -translate-y-1"
                      }
                    `}
                    style={{
                      transitionDelay: isOpen ? "70ms" : "0ms",
                    }}
                  >
                    {chapter.subChapters.map((sub) => (
                      <SidebarLink
                        key={sub.path}
                        href={sub.path}
                        active={pathname === sub.path}
                      >
                        {sub.title}
                      </SidebarLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
