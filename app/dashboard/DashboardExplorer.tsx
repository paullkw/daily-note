"use client";

import { useEffect, useState, type MouseEvent } from "react";

import { logout } from "@/app/actions/auth";

const mediaItems = [
  {
    label: "Music",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" />
        <circle cx="12" cy="18" r="3" />
        <path d="M12 8c1.5-1.2 3.3-1.8 5.4-1.8" />
      </svg>
    ),
  },
  {
    label: "Game",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="9" cy="12" r="1.2" />
        <circle cx="15" cy="12" r="1.2" />
      </svg>
    ),
  },
  {
    label: "Comic",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    label: "Movie",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 5v14" />
        <path d="M17 5v14" />
      </svg>
    ),
  },
  {
    label: "Book",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 0-2 2" />
        <path d="M6 4v16" />
        <path d="M10 8h6" />
      </svg>
    ),
  },
  {
    label: "Anime",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16v12H4z" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="15" cy="12" r="1" />
        <path d="M8 16c1.5-1 2.8-1.5 4-1.5s2.5.5 4 1.5" />
      </svg>
    ),
  },
];

const dramaChildren = ["Japan", "Korea"];

type ContextScope = "root" | "item";

type MenuState = {
  open: boolean;
  x: number;
  y: number;
  scope: ContextScope;
};

function FolderIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h7l2 2h9v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 7V6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function DashboardExplorer() {
  const [menu, setMenu] = useState<MenuState>({ open: false, x: 0, y: 0, scope: "root" });
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => {
      setMenu((current) => (current.open ? { ...current, open: false } : current));
      setCreateOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const openMenuAt = (event: MouseEvent, scope: ContextScope) => {
    event.preventDefault();
    event.stopPropagation();
    setMenu({
      open: true,
      x: event.clientX,
      y: event.clientY,
      scope,
    });
    setCreateOpen(false);
  };

  const treeRowClass = "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid w-full grid-cols-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:grid-cols-[260px_1fr]">
        <aside className="border-b border-zinc-200 bg-zinc-50 p-4 md:border-b-0 md:border-r" onContextMenu={(event) => openMenuAt(event, "root")}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Explorer</h1>
            <form action={logout}>
              <button type="submit" className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100">
                Logout
              </button>
            </form>
          </div>

          <nav aria-label="Dashboard tree view">
            <ul className="space-y-1 text-sm text-zinc-700">
              {mediaItems.slice(0, 3).map((item) => (
                <li key={item.label} className={treeRowClass} onContextMenu={(event) => openMenuAt(event, "item")}>
                  <span className="text-zinc-500">▸</span>
                  {item.icon}
                  <span>{item.label}</span>
                </li>
              ))}

              <li>
                <div className={treeRowClass} onContextMenu={(event) => openMenuAt(event, "item")}>
                  <span className="text-zinc-500">▾</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 5h14v14H5z" />
                    <path d="M5 10h14" />
                    <path d="M12 10v9" />
                  </svg>
                  <span>Drama</span>
                </div>

                <ul className="mt-0.5 space-y-1 pl-7 text-sm text-zinc-700">
                  {dramaChildren.map((child) => (
                    <li key={child} className={treeRowClass} onContextMenu={(event) => openMenuAt(event, "item")}>
                      <FolderIcon />
                      <span>{child}</span>
                    </li>
                  ))}
                </ul>
              </li>

              {mediaItems.slice(3).map((item) => (
                <li key={item.label} className={treeRowClass} onContextMenu={(event) => openMenuAt(event, "item")}>
                  <span className="text-zinc-500">▸</span>
                  {item.icon}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="min-h-[420px] bg-white" aria-label="Dashboard content area" />
      </div>

      {menu.open ? (
        <div className="fixed z-50 min-w-44 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl" style={{ left: menu.x, top: menu.y }}>
          <button type="button" className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100" onMouseEnter={() => setCreateOpen(false)}>
            Rename
          </button>

          <div className="relative" onMouseEnter={() => setCreateOpen(true)} onMouseLeave={() => setCreateOpen(false)}>
            <button type="button" className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100">
              <span>Create</span>
              <span className="text-zinc-500">›</span>
            </button>

            {createOpen ? (
              <div className="absolute left-full top-0 ml-1 min-w-40 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl">
                <button type="button" className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100">
                  <FolderIcon />
                  <span className="ml-2">Folder</span>
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-1 border-t border-zinc-100 pt-1 text-xs text-zinc-500">
            {menu.scope === "root" ? "Right-clicked Explorer" : "Right-clicked item"}
          </div>
        </div>
      ) : null}
    </main>
  );
}
