"use client";

import { useEffect, useState, type DragEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from "react";

import { logout } from "@/app/actions/auth";
import { saveDashboardExplorerState } from "./actions";
import type { ExplorerIconKey, ExplorerNode, ExplorerState } from "./explorer-state";

type ContextScope = "root" | "item";

type TreeTarget = { id: string };

type MenuState = {
  open: boolean;
  x: number;
  y: number;
  scope: ContextScope;
  targetId: string | null;
};

const SETTING_NODE_ID = "setting";

function FolderIcon({ open }: { open?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M3 8h18l-2 10H5z" />
          <path d="M3 8V6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v0" />
        </>
      ) : (
        <>
          <path d="M3 7h7l2 2h9v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M3 7V6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v1" />
        </>
      )}
    </svg>
  );
}

function ItemIcon({ iconKey }: { iconKey?: ExplorerIconKey }) {
  if (iconKey === "music") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" />
        <circle cx="12" cy="18" r="3" />
        <path d="M12 8c1.5-1.2 3.3-1.8 5.4-1.8" />
      </svg>
    );
  }

  if (iconKey === "game") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="9" cy="12" r="1.2" />
        <circle cx="15" cy="12" r="1.2" />
      </svg>
    );
  }

  if (iconKey === "comic") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
      </svg>
    );
  }

  if (iconKey === "movie") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 5v14" />
        <path d="M17 5v14" />
      </svg>
    );
  }

  if (iconKey === "book") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 0-2 2" />
        <path d="M6 4v16" />
        <path d="M10 8h6" />
      </svg>
    );
  }

  if (iconKey === "anime") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16v12H4z" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="15" cy="12" r="1" />
        <path d="M8 16c1.5-1 2.8-1.5 4-1.5s2.5.5 4 1.5" />
      </svg>
    );
  }

  if (iconKey === "setting") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2" />
        <path d="M12 19v2" />
        <path d="M3 12h2" />
        <path d="M19 12h2" />
        <path d="M5.6 5.6l1.4 1.4" />
        <path d="M17 17l1.4 1.4" />
        <path d="M5.6 18.4 7 17" />
        <path d="M17 7l1.4-1.4" />
      </svg>
    );
  }

  return <FolderIcon />;
}

function findNodeById(nodes: ExplorerNode[], nodeId: string): ExplorerNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }

    const childNodes = node.children ?? [];
    const found = findNodeById(childNodes, nodeId);

    if (found) {
      return found;
    }
  }

  return null;
}

function renameNode(nodes: ExplorerNode[], nodeId: string, nextName: string): ExplorerNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, name: nextName };
    }

    if (!node.children || node.children.length === 0) {
      return node;
    }

    return { ...node, children: renameNode(node.children, nodeId, nextName) };
  });
}

function addChildFolder(nodes: ExplorerNode[], parentId: string | null, child: ExplorerNode): ExplorerNode[] {
  if (!parentId) {
    return [...nodes, child];
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      const currentChildren = node.children ?? [];
      return { ...node, kind: "folder", children: [...currentChildren, child] };
    }

    if (!node.children || node.children.length === 0) {
      return node;
    }

    return { ...node, children: addChildFolder(node.children, parentId, child) };
  });
}

function addNodeToFolder(nodes: ExplorerNode[], folderId: string, child: ExplorerNode): ExplorerNode[] {
  return nodes.map((node) => {
    if (node.id === folderId) {
      const currentChildren = node.children ?? [];
      return { ...node, kind: "folder", children: [...currentChildren, child] };
    }

    if (!node.children || node.children.length === 0) {
      return node;
    }

    return { ...node, children: addNodeToFolder(node.children, folderId, child) };
  });
}

function removeNode(nodes: ExplorerNode[], nodeId: string): ExplorerNode[] {
  const filtered = nodes.filter((node) => node.id !== nodeId);
  return filtered.map((node) => {
    if (!node.children || node.children.length === 0) {
      return node;
    }

    return { ...node, children: removeNode(node.children, nodeId) };
  });
}

function detachNode(nodes: ExplorerNode[], nodeId: string): { nodes: ExplorerNode[]; detached: ExplorerNode | null } {
  let detached: ExplorerNode | null = null;

  const nextNodes: ExplorerNode[] = [];
  for (const node of nodes) {
    if (node.id === nodeId) {
      detached = node;
      continue;
    }

    if (!node.children || node.children.length === 0) {
      nextNodes.push(node);
      continue;
    }

    const result = detachNode(node.children, nodeId);
    if (result.detached) {
      detached = result.detached;
    }

    nextNodes.push({ ...node, children: result.nodes });
  }

  return { nodes: nextNodes, detached };
}

function insertAfterNode(nodes: ExplorerNode[], targetId: string, nodeToInsert: ExplorerNode): { nodes: ExplorerNode[]; inserted: boolean } {
  const directIndex = nodes.findIndex((node) => node.id === targetId);
  if (directIndex >= 0) {
    const nextNodes = [...nodes];
    nextNodes.splice(directIndex + 1, 0, nodeToInsert);
    return { nodes: nextNodes, inserted: true };
  }

  let inserted = false;
  const nextNodes = nodes.map((node) => {
    if (!node.children || node.children.length === 0) {
      return node;
    }

    const result = insertAfterNode(node.children, targetId, nodeToInsert);
    if (result.inserted) {
      inserted = true;
      return { ...node, children: result.nodes };
    }

    return node;
  });

  return { nodes: nextNodes, inserted };
}

function containsNode(nodes: ExplorerNode[], nodeId: string): boolean {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return true;
    }

    if (node.children && node.children.length > 0 && containsNode(node.children, nodeId)) {
      return true;
    }
  }

  return false;
}

function createNodeId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `node-${Date.now()}-${random}`;
}

function collectFolderIds(nodes: ExplorerNode[]): Set<string> {
  const folderIds = new Set<string>();

  const walk = (currentNodes: ExplorerNode[]) => {
    for (const node of currentNodes) {
      if (node.kind === "folder") {
        folderIds.add(node.id);
      }

      if (node.children && node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(nodes);
  return folderIds;
}

type DashboardExplorerProps = {
  initialState: ExplorerState;
};

const TEMPLATE_NAMES: string[] = [];
const TEMPLATE_ITEM_NAMES: string[] = [];

export default function DashboardExplorer({ initialState }: DashboardExplorerProps) {
  const [treeNodes, setTreeNodes] = useState<ExplorerNode[]>(() => initialState.nodes);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => collectFolderIds(initialState.nodes));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuState>({ open: false, x: 0, y: 0, scope: "root", targetId: null });
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

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

  useEffect(() => {
    const validFolderIds = collectFolderIds(treeNodes);

    setExpandedFolderIds((current) => {
      const next = new Set<string>();

      for (const folderId of current) {
        if (validFolderIds.has(folderId)) {
          next.add(folderId);
        }
      }

      for (const folderId of validFolderIds) {
        if (!current.has(folderId)) {
          next.add(folderId);
        }
      }

      return next;
    });
  }, [treeNodes]);

  const openMenuAt = (event: MouseEvent, scope: ContextScope, target: TreeTarget | null = null) => {
    event.preventDefault();
    event.stopPropagation();
    setMenu({
      open: true,
      x: event.clientX,
      y: event.clientY,
      scope,
      targetId: target ? target.id : null,
    });
    setCreateOpen(false);
  };

  const persistTree = async (nextNodes: ExplorerNode[]) => {
    setTreeNodes(nextNodes);
    await saveDashboardExplorerState({ nodes: nextNodes });
  };

  const commitRename = async () => {
    const nextValue = editingValue.trim();

    if (!editingTargetId || !nextValue) {
      setEditingTargetId(null);
      setEditingValue("");
      return;
    }

    const nextNodes = renameNode(treeNodes, editingTargetId, nextValue);
    void persistTree(nextNodes);

    setEditingTargetId(null);
    setEditingValue("");
  };

  const handleRenameKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void commitRename();
    }

    if (event.key === "Escape") {
      setEditingTargetId(null);
      setEditingValue("");
    }
  };

  const startRename = () => {
    if (!menu.targetId) {
      return;
    }

    const target = findNodeById(treeNodes, menu.targetId);

    if (!target) {
      return;
    }

    setEditingTargetId(target.id);
    setEditingValue(target.name);
    setMenu((current) => ({ ...current, open: false }));
    setCreateOpen(false);
  };

  const createFolder = () => {
    const targetId = menu.targetId;
    const targetNode = targetId ? findNodeById(treeNodes, targetId) : null;
    const parentId = targetNode ? targetId : null;
    const newFolderId = createNodeId();
    const newFolderName = "New Folder";
    const nextNodes = addChildFolder(treeNodes, parentId, {
      id: newFolderId,
      name: newFolderName,
      kind: "folder",
      children: [],
    });

    void persistTree(nextNodes);
    setExpandedFolderIds((current) => {
      const next = new Set(current);
      if (parentId) {
        next.add(parentId);
      }
      next.add(newFolderId);
      return next;
    });
    setEditingTargetId(newFolderId);
    setEditingValue(newFolderName);
    setMenu((current) => ({ ...current, open: false }));
    setCreateOpen(false);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolderIds((current) => {
      const next = new Set(current);

      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }

      return next;
    });
  };

  const removeSelected = () => {
    if (!menu.targetId) {
      return;
    }

    const nextNodes = removeNode(treeNodes, menu.targetId);
    void persistTree(nextNodes);
    setMenu((current) => ({ ...current, open: false, targetId: null }));
    setCreateOpen(false);
    if (editingTargetId === menu.targetId) {
      setEditingTargetId(null);
      setEditingValue("");
    }
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, nodeId: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", nodeId);
    setDraggingId(nodeId);
  };

  const handleDragOverNode = (event: DragEvent<HTMLDivElement>, nodeId: string) => {
    if (nodeId === SETTING_NODE_ID) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setDropTargetId(nodeId);
  };

  const handleDropNode = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    event.stopPropagation();
    const draggedId = event.dataTransfer.getData("text/plain") || draggingId;

    setDropTargetId(null);
    setDraggingId(null);

    if (targetId === SETTING_NODE_ID) {
      return;
    }

    if (!draggedId || draggedId === targetId) {
      return;
    }

    const draggedNode = findNodeById(treeNodes, draggedId);
    const targetNode = findNodeById(treeNodes, targetId);
    if (!draggedNode) {
      return;
    }

    if (!targetNode) {
      return;
    }

    if (containsNode(draggedNode.children ?? [], targetId)) {
      return;
    }

    const detachedResult = detachNode(treeNodes, draggedId);
    if (!detachedResult.detached) {
      return;
    }

    const nextNodes =
      targetNode.kind === "folder"
        ? addNodeToFolder(detachedResult.nodes, targetId, detachedResult.detached)
        : (() => {
            const insertResult = insertAfterNode(detachedResult.nodes, targetId, detachedResult.detached);
            return insertResult.inserted ? insertResult.nodes : [...detachedResult.nodes, detachedResult.detached];
          })();

    void persistTree(nextNodes);
  };

  const handleDropRoot = (event: DragEvent<HTMLUListElement>) => {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData("text/plain") || draggingId;

    setDropTargetId(null);
    setDraggingId(null);

    if (!draggedId) {
      return;
    }

    const detachedResult = detachNode(treeNodes, draggedId);
    if (!detachedResult.detached) {
      return;
    }

    const nextNodes = [...detachedResult.nodes, detachedResult.detached];
    void persistTree(nextNodes);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTargetId(null);
  };

  const treeRowClass = "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100";
  const showSettingsPage = selectedNodeId === SETTING_NODE_ID;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid w-full grid-cols-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:grid-cols-[260px_1fr]">
        <aside className="border-b border-zinc-200 bg-zinc-50 p-4 md:border-b-0 md:border-r" onContextMenu={(event) => openMenuAt(event, "root", null)}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Explorer</h1>
            <form action={logout}>
              <button type="submit" className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100">
                Logout
              </button>
            </form>
          </div>

          <nav aria-label="Dashboard tree view">
            <ul
              className="space-y-1 text-sm text-zinc-700"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDropRoot}
            >
              {treeNodes.map((node) => {
                const renderNode = (currentNode: ExplorerNode, depth: number) => {
                  const childNodes = currentNode.children ?? [];
                  const hasChildren = childNodes.length > 0;
                  const isFolder = currentNode.kind === "folder";
                  const isExpanded = isFolder && expandedFolderIds.has(currentNode.id);
                  const disableContextMenu = currentNode.id === SETTING_NODE_ID;
                  const isSelected = selectedNodeId === currentNode.id;
                  const isEditing = editingTargetId === currentNode.id;
                  const isDragSource = draggingId === currentNode.id;
                  const isDropTarget = dropTargetId === currentNode.id;

                  return (
                    <li key={currentNode.id}>
                      <div
                        className={`${treeRowClass} ${isSelected ? "bg-zinc-100" : ""} ${isDropTarget ? "bg-zinc-200" : ""} ${isDragSource ? "opacity-50" : ""}`}
                        style={{ paddingLeft: `${0.5 + depth * 1.25}rem` }}
                        onClick={() => setSelectedNodeId(currentNode.id)}
                        onContextMenu={(event) => {
                          if (disableContextMenu) {
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                          }

                          openMenuAt(event, "item", { id: currentNode.id });
                        }}
                        draggable
                        onDragStart={(event) => handleDragStart(event, currentNode.id)}
                        onDragOver={(event) => handleDragOverNode(event, currentNode.id)}
                        onDrop={(event) => handleDropNode(event, currentNode.id)}
                        onDragEnd={handleDragEnd}
                        onDoubleClick={() => {
                          if (isFolder && !isEditing) {
                            toggleFolder(currentNode.id);
                          }
                        }}
                      >
                        <span className="text-zinc-500">{hasChildren ? (isExpanded ? "▾" : "▸") : ""}</span>
                        {isFolder ? <FolderIcon open={isExpanded} /> : <ItemIcon iconKey={currentNode.iconKey} />}
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editingValue}
                            onChange={(event) => setEditingValue(event.target.value)}
                            onBlur={() => void commitRename()}
                            onKeyDown={handleRenameKeyDown}
                            className="w-full rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                          />
                        ) : (
                          <span>{currentNode.name}</span>
                        )}
                      </div>

                      {isFolder && isExpanded && hasChildren ? <ul className="space-y-1">{childNodes.map((child) => renderNode(child, depth + 1))}</ul> : null}
                    </li>
                  );
                };

                return renderNode(node, 0);
              })}
            </ul>
          </nav>
        </aside>

        <section className="min-h-[420px] bg-white p-6" aria-label="Dashboard content area">
          {showSettingsPage ? (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold text-zinc-800">Setting</h2>
                <p className="mt-1 text-sm text-zinc-500">Manage templates and template items for your notes.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100">
                  Create template
                </button>
                <button type="button" className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100">
                  Create template item
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="rounded-lg border border-zinc-200 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Template list</h3>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                    {TEMPLATE_NAMES.map((name) => (
                      <li key={name} className="rounded-md bg-zinc-50 px-3 py-2">
                        {name}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-lg border border-zinc-200 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Template item list</h3>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                    {TEMPLATE_ITEM_NAMES.map((name) => (
                      <li key={name} className="rounded-md bg-zinc-50 px-3 py-2">
                        {name}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {menu.open ? (
        <div className="fixed z-50 min-w-44 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl" style={{ left: menu.x, top: menu.y }}>
          <div className="relative" onMouseEnter={() => setCreateOpen(true)} onMouseLeave={() => setCreateOpen(false)}>
            <button type="button" className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100">
              <span>Create</span>
              <span className="text-zinc-500">›</span>
            </button>

            {createOpen ? (
              <div className="absolute left-full top-0 ml-1 min-w-40 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl">
                <button type="button" className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100" onClick={createFolder}>
                  <FolderIcon />
                  <span className="ml-2">Folder</span>
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
            onMouseEnter={() => setCreateOpen(false)}
            onClick={startRename}
            disabled={!menu.targetId}
          >
            Rename
          </button>

          <button
            type="button"
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
            onClick={removeSelected}
            disabled={!menu.targetId}
          >
            Remove
          </button>
        </div>
      ) : null}
    </main>
  );
}
