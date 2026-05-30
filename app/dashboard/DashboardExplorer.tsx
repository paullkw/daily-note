"use client";

import { useEffect, useState, type DragEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from "react";

import { logout } from "@/app/actions/auth";
import { saveDashboardExplorerState } from "./actions";
import type { ExplorerIconKey, ExplorerNode, ExplorerState, TemplateDefinition, TemplateInstanceState, TemplateItemDefinition } from "./explorer-state";

type ContextScope = "root" | "item";

type TreeTarget = { id: string };

type MenuState = {
  open: boolean;
  x: number;
  y: number;
  scope: ContextScope;
  targetId: string | null;
};

type TemplateDraftEntry = {
  draftId: string;
  itemState: TemplateItemDefinition;
};

const SETTING_NODE_ID = "setting";
const EPISODE_TEMPLATE_ITEM_NAME = "Episode";

type SettingView = "overview" | "template-editor" | "episode-editor" | "textbox-editor" | "textarea-editor";

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

  if (iconKey === "drama") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16v10H4z" />
        <path d="M8 7l2 10" />
        <path d="M12 7l2 10" />
        <path d="M16 7l-2 10" />
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

  if (iconKey === "template") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h12v16H6z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h3" />
      </svg>
    );
  }

  return <FolderIcon />;
}

function CommentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16v10H9l-4 4V6z" />
    </svg>
  );
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

function addChildItem(nodes: ExplorerNode[], parentId: string | null, child: ExplorerNode): ExplorerNode[] {
  if (!parentId) {
    return [...nodes, child];
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      const currentChildren = node.children ?? [];
      return { ...node, children: [...currentChildren, child] };
    }

    if (!node.children || node.children.length === 0) {
      return node;
    }

    return { ...node, children: addChildItem(node.children, parentId, child) };
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

function cloneTemplateItemDefinition(item: TemplateItemDefinition): TemplateItemDefinition {
  if (item.type === "episode") {
    return {
      ...item,
      config: {
        ...item.config,
        watchedEpisodes: [...item.config.watchedEpisodes],
        favoriteEpisodes: [...item.config.favoriteEpisodes],
        episodeComments: { ...item.config.episodeComments },
      },
    };
  }

  return {
    ...item,
    config: {
      ...item.config,
    },
  };
}

function createTemplateItemState(item: TemplateItemDefinition): TemplateItemDefinition {
  return {
    ...cloneTemplateItemDefinition(item),
    id: createNodeId(),
  };
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

function reorderTemplateDraftEntries(entries: TemplateDraftEntry[], draggedId: string, targetId: string): TemplateDraftEntry[] {
  if (draggedId === targetId) {
    return entries;
  }

  const draggedEntry = entries.find((entry) => entry.draftId === draggedId);

  if (!draggedEntry) {
    return entries;
  }

  const nextEntries = entries.filter((entry) => entry.draftId !== draggedId);
  const targetIndex = nextEntries.findIndex((entry) => entry.draftId === targetId);

  if (targetIndex < 0) {
    return [...nextEntries, draggedEntry];
  }

  nextEntries.splice(targetIndex, 0, draggedEntry);
  return nextEntries;
}

function parseEpisodeInputValue(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function filterEpisodeCommentsByRange(episodeComments: Record<string, string>, startEpisode: number | null, endEpisode: number | null): Record<string, string> {
  if (startEpisode === null || endEpisode === null || endEpisode < startEpisode) {
    return {};
  }

  const nextEntries = Object.entries(episodeComments)
    .filter(([episodeNumber, comment]) => {
      const parsedEpisodeNumber = Number(episodeNumber);
      return Number.isInteger(parsedEpisodeNumber) && parsedEpisodeNumber >= startEpisode && parsedEpisodeNumber <= endEpisode && comment.trim().length > 0;
    })
    .map(([episodeNumber, comment]) => [episodeNumber, comment.trim()] as const);

  return Object.fromEntries(nextEntries);
}

function filterEpisodeNumbersByRange(episodes: Set<number>, startEpisode: number | null, endEpisode: number | null): number[] {
  if (startEpisode === null || endEpisode === null || endEpisode < startEpisode) {
    return [];
  }

  return Array.from(episodes).filter((episodeNumber) => episodeNumber >= startEpisode && episodeNumber <= endEpisode);
}

function findTemplateByName(templates: TemplateDefinition[], name: string): TemplateDefinition | null {
  return templates.find((template) => template.name === name) ?? null;
}

function findTemplateForNode(
  nodes: ExplorerNode[],
  targetNodeId: string,
  templates: TemplateDefinition[],
  inheritedTemplate: TemplateDefinition | null = null,
): TemplateDefinition | null {
  for (const node of nodes) {
    const directTemplate =
      node.templateId
        ? templates.find((template) => template.id === node.templateId) ?? null
        : findTemplateByName(templates, node.name);
    const effectiveTemplate = directTemplate ?? inheritedTemplate;

    if (node.id === targetNodeId) {
      return effectiveTemplate;
    }

    if (!node.children || node.children.length === 0) {
      continue;
    }

    const childResult = findTemplateForNode(node.children, targetNodeId, templates, effectiveTemplate);

    if (childResult) {
      return childResult;
    }
  }

  return null;
}

function createTemplateBoundItem(template: TemplateDefinition, templateItems: TemplateItemDefinition[]): ExplorerNode {
  return {
    id: createNodeId(),
    name: `${template.name} Item`,
    kind: "item",
    iconKey: "template",
    templateId: template.id,
    templateState: createTemplateInstanceState(template, templateItems),
    children: [],
  };
}

function createTemplateInstanceState(template: TemplateDefinition, templateItems: TemplateItemDefinition[]): TemplateInstanceState {
  const sourceStates =
    template.itemStates.length > 0
      ? template.itemStates
      : template.itemIds
          .map((itemId) => templateItems.find((item) => item.id === itemId) ?? null)
          .filter((item): item is TemplateItemDefinition => Boolean(item));

  const itemStates = sourceStates.map((item) => createTemplateItemState(item));

  return { itemStates };
}

function updateNodeTemplateState(nodes: ExplorerNode[], nodeId: string, nextTemplateState: TemplateInstanceState): ExplorerNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, templateState: nextTemplateState };
    }

    if (!node.children || node.children.length === 0) {
      return node;
    }

    return { ...node, children: updateNodeTemplateState(node.children, nodeId, nextTemplateState) };
  });
}

function clearTemplateBinding(nodes: ExplorerNode[], templateId: string): ExplorerNode[] {
  return nodes.map((node) => {
    const nextChildren = node.children && node.children.length > 0 ? clearTemplateBinding(node.children, templateId) : node.children;

    if (node.templateId === templateId) {
      return {
        ...node,
        templateId: undefined,
        templateState: undefined,
        children: nextChildren,
      };
    }

    return {
      ...node,
      children: nextChildren,
    };
  });
}

type DashboardExplorerProps = {
  initialState: ExplorerState;
};

export default function DashboardExplorer({ initialState }: DashboardExplorerProps) {
  const [treeNodes, setTreeNodes] = useState<ExplorerNode[]>(() => initialState.nodes);
  const [templates, setTemplates] = useState<TemplateDefinition[]>(() => initialState.templates);
  const [templateItems, setTemplateItems] = useState<TemplateItemDefinition[]>(() => initialState.templateItems);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => collectFolderIds(initialState.nodes));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [settingView, setSettingView] = useState<SettingView>("overview");
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [activeTemplateItemId, setActiveTemplateItemId] = useState<string | null>(null);
  const [templateDraftEntries, setTemplateDraftEntries] = useState<TemplateDraftEntry[]>([]);
  const [templateDraftDirty, setTemplateDraftDirty] = useState(false);
  const [templateAddMenuOpen, setTemplateAddMenuOpen] = useState(false);
  const [templateNameDraft, setTemplateNameDraft] = useState("");
  const [selectedTemplateAddMenuOpen, setSelectedTemplateAddMenuOpen] = useState(false);
  const [selectedTemplateEditingLabelItemId, setSelectedTemplateEditingLabelItemId] = useState<string | null>(null);
  const [selectedTemplateEditingLabelValue, setSelectedTemplateEditingLabelValue] = useState("");
  const [draggingTemplateEditorItemId, setDraggingTemplateEditorItemId] = useState<string | null>(null);
  const [templateEditorDropTargetId, setTemplateEditorDropTargetId] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuState>({ open: false, x: 0, y: 0, scope: "root", targetId: null });
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [episodeCommentDialog, setEpisodeCommentDialog] = useState<{
    open: boolean;
    source: "template-item" | "template-instance";
    itemId: string | null;
    episodeNumber: number | null;
    comment: string;
  }>({
    open: false,
    source: "template-item",
    itemId: null,
    episodeNumber: null,
    comment: "",
  });

  const activeTemplate = activeTemplateId ? templates.find((template) => template.id === activeTemplateId) ?? null : null;
  const activeTemplateItem = activeTemplateItemId ? templateItems.find((item) => item.id === activeTemplateItemId) ?? null : null;
  const draftTemplateItems = templateDraftEntries.map((entry) => ({
    draftId: entry.draftId,
    item: entry.itemState,
  }));
  const episodeTemplateConfig = activeTemplateItem?.type === "episode" ? activeTemplateItem.config : null;
  const textboxTemplateConfig = activeTemplateItem?.type === "textbox" ? activeTemplateItem.config : null;
  const textareaTemplateConfig = activeTemplateItem?.type === "textarea" ? activeTemplateItem.config : null;
  const episodeStartEpisode = episodeTemplateConfig?.startEpisode;
  const episodeEndEpisode = episodeTemplateConfig?.endEpisode;
  const episodeLabel = episodeTemplateConfig?.label ?? EPISODE_TEMPLATE_ITEM_NAME;
  const startEpisode = episodeStartEpisode === null || episodeStartEpisode === undefined ? "" : String(episodeStartEpisode);
  const lastEpisode = episodeEndEpisode === null || episodeEndEpisode === undefined ? "" : String(episodeEndEpisode);
  const watchedEpisodes = new Set(episodeTemplateConfig?.watchedEpisodes ?? []);
  const favoriteEpisodes = new Set(episodeTemplateConfig?.favoriteEpisodes ?? []);
  const episodeComments = episodeTemplateConfig?.episodeComments ?? {};
  const textboxLabel = textboxTemplateConfig?.label ?? "Label";
  const textboxValue = textboxTemplateConfig?.value ?? "";
  const textareaLabel = textareaTemplateConfig?.label ?? "Label";
  const textareaValue = textareaTemplateConfig?.value ?? "";
  const hasValidEpisodeRange =
    episodeStartEpisode !== null &&
    episodeStartEpisode !== undefined &&
    episodeEndEpisode !== null &&
    episodeEndEpisode !== undefined &&
    episodeEndEpisode >= episodeStartEpisode;
  const generatedEpisodes = hasValidEpisodeRange
    ? Array.from({ length: episodeEndEpisode - episodeStartEpisode + 1 }, (_, index) => episodeStartEpisode + index)
    : [];

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

  const persistDashboardState = async ({
    nextNodes = treeNodes,
    nextTemplates = templates,
    nextTemplateItems = templateItems,
  }: {
    nextNodes?: ExplorerNode[];
    nextTemplates?: TemplateDefinition[];
    nextTemplateItems?: TemplateItemDefinition[];
  }) => {
    setTreeNodes(nextNodes);
    setTemplates(nextTemplates);
    setTemplateItems(nextTemplateItems);
    await saveDashboardExplorerState({
      nodes: nextNodes,
      templates: nextTemplates,
      templateItems: nextTemplateItems,
    });
  };

  const persistTree = async (nextNodes: ExplorerNode[]) => {
    await persistDashboardState({ nextNodes });
  };

  const persistTemplateItems = async (nextTemplateItems: TemplateItemDefinition[]) => {
    await persistDashboardState({ nextTemplateItems });
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

  const createTemplateItem = () => {
    if (!menu.targetId) {
      return;
    }

    const targetNode = findNodeById(treeNodes, menu.targetId);

    if (!targetNode || targetNode.kind !== "folder") {
      return;
    }

    const template = findTemplateForNode(treeNodes, targetNode.id, templates);

    if (!template) {
      return;
    }

    const newItem = createTemplateBoundItem(template, templateItems);
    const nextNodes = addChildItem(treeNodes, targetNode.id, newItem);

    void persistTree(nextNodes);
    setExpandedFolderIds((current) => {
      const next = new Set(current);
      next.add(targetNode.id);
      return next;
    });
    setMenu((current) => ({ ...current, open: false, targetId: null }));
    setCreateOpen(false);
    setSelectedNodeId(newItem.id);
    setEditingTargetId(newItem.id);
    setEditingValue(newItem.name);
  };

  const createFolder = () => {
    const targetId = menu.targetId;
    const targetNode = targetId ? findNodeById(treeNodes, targetId) : null;
    if (targetNode && targetNode.kind !== "folder") {
      return;
    }

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
  const selectedNode = selectedNodeId ? findNodeById(treeNodes, selectedNodeId) : null;
  const selectedTemplateNode = selectedNode && selectedNode.kind === "item" && selectedNode.templateId ? selectedNode : null;
  const selectedTemplate = selectedTemplateNode ? templates.find((template) => template.id === selectedTemplateNode.templateId) ?? null : null;
  const selectedTemplateState = selectedTemplateNode
    ? selectedTemplateNode.templateState ?? (selectedTemplate ? createTemplateInstanceState(selectedTemplate, templateItems) : null)
    : null;
  const selectedTemplateAddableItems = templateItems;

  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSettingView("overview");
    setActiveTemplateId(null);
    setActiveTemplateItemId(null);
    setTemplateDraftEntries([]);
    setTemplateDraftDirty(false);
    setTemplateAddMenuOpen(false);
    setTemplateNameDraft("");
    setSelectedTemplateAddMenuOpen(false);
    setSelectedTemplateEditingLabelItemId(null);
    setSelectedTemplateEditingLabelValue("");
  };

  const commitTemplateName = async () => {
    if (!activeTemplateId) {
      return;
    }

    const nextName = templateNameDraft.trim() || "Untitled Template";
    const currentTemplate = templates.find((template) => template.id === activeTemplateId);

    if (!currentTemplate) {
      return;
    }

    if (currentTemplate.name === nextName) {
      setTemplateNameDraft(nextName);
      return;
    }

    const nextTemplates = templates.map((template) => (
      template.id === activeTemplateId
        ? { ...template, name: nextName }
        : template
    ));

    await persistDashboardState({ nextTemplates });
    setTemplateNameDraft(nextName);
  };

  const handleTemplateNameKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void commitTemplateName();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setTemplateNameDraft(activeTemplate?.name ?? "");
    }
  };

  const startSelectedTemplateLabelEdit = (itemId: string, currentLabel: string) => {
    setSelectedTemplateEditingLabelItemId(itemId);
    setSelectedTemplateEditingLabelValue(currentLabel);
  };

  const cancelSelectedTemplateLabelEdit = () => {
    setSelectedTemplateEditingLabelItemId(null);
    setSelectedTemplateEditingLabelValue("");
  };

  const commitSelectedTemplateLabelEdit = async () => {
    if (!selectedTemplateEditingLabelItemId) {
      return;
    }

    await updateSelectedTemplateItemLabel(selectedTemplateEditingLabelItemId, selectedTemplateEditingLabelValue);
    cancelSelectedTemplateLabelEdit();
  };

  const handleSelectedTemplateLabelKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void commitSelectedTemplateLabelEdit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelSelectedTemplateLabelEdit();
    }
  };

  const persistSelectedTemplateState = async (nextTemplateState: TemplateInstanceState) => {
    if (!selectedTemplateNode) {
      return;
    }

    const nextNodes = updateNodeTemplateState(treeNodes, selectedTemplateNode.id, nextTemplateState);
    await persistTree(nextNodes);
  };

  const updateSelectedTemplateItemState = async (itemId: string, updater: (item: TemplateItemDefinition) => TemplateItemDefinition) => {
    if (!selectedTemplateState) {
      return;
    }

    const nextItemStates = selectedTemplateState.itemStates.map((item) => (item.id === itemId ? updater(item) : item));
    await persistSelectedTemplateState({ itemStates: nextItemStates });
  };

  const updateSelectedEpisodeItemState = async (
    itemId: string,
    nextLabel: string,
    nextStartValue: string,
    nextLastValue: string,
    nextWatchedEpisodes: Set<number>,
    nextEpisodeComments?: Record<string, string>,
    nextFavoriteEpisodes?: Set<number>,
  ) => {
    const nextStartEpisode = parseEpisodeInputValue(nextStartValue);
    const nextLastEpisode = parseEpisodeInputValue(nextLastValue);
    const hasValidRange = nextStartEpisode !== null && nextLastEpisode !== null && nextLastEpisode >= nextStartEpisode;
    const filteredWatchedEpisodes = hasValidRange ? filterEpisodeNumbersByRange(nextWatchedEpisodes, nextStartEpisode, nextLastEpisode) : [];
    const currentItem = selectedTemplateState?.itemStates.find((item) => item.id === itemId);
    const currentEpisodeComments = nextEpisodeComments ?? (currentItem && currentItem.type === "episode" ? currentItem.config.episodeComments : {});
    const currentFavoriteEpisodes = nextFavoriteEpisodes ?? new Set(currentItem && currentItem.type === "episode" ? currentItem.config.favoriteEpisodes : []);
    const filteredEpisodeComments = hasValidRange ? filterEpisodeCommentsByRange(currentEpisodeComments, nextStartEpisode, nextLastEpisode) : {};
    const filteredFavoriteEpisodes = hasValidRange ? filterEpisodeNumbersByRange(currentFavoriteEpisodes, nextStartEpisode, nextLastEpisode) : [];

    await updateSelectedTemplateItemState(itemId, (item) => {
      if (item.type !== "episode") {
        return item;
      }

      return {
        ...item,
        config: {
          label: nextLabel,
          startEpisode: nextStartEpisode,
          endEpisode: hasValidRange ? nextLastEpisode : null,
          watchedEpisodes: filteredWatchedEpisodes,
          favoriteEpisodes: filteredFavoriteEpisodes,
          episodeComments: filteredEpisodeComments,
        },
      };
    });
  };

  const updateSelectedTemplateItemLabel = async (itemId: string, nextLabel: string) => {
    await updateSelectedTemplateItemState(itemId, (item) => {
      if (item.type === "episode") {
        return {
          ...item,
          config: {
            ...item.config,
            label: nextLabel,
          },
        };
      }

      if (item.type === "textbox" || item.type === "textarea") {
        return {
          ...item,
          config: {
            ...item.config,
            label: nextLabel,
          },
        };
      }

      return item;
    });
  };

  const addSelectedTemplateItem = async (sourceItemId: string) => {
    if (!selectedTemplateState) {
      return;
    }

    const sourceItem = selectedTemplateAddableItems.find((item) => item.id === sourceItemId);

    if (!sourceItem) {
      return;
    }

    const nextItemStates = [...selectedTemplateState.itemStates, createTemplateItemState(sourceItem)];
    await persistSelectedTemplateState({ itemStates: nextItemStates });
    setSelectedTemplateAddMenuOpen(false);
  };

  const removeSelectedTemplateItem = async (itemId: string) => {
    if (!selectedTemplateState) {
      return;
    }

    const nextItemStates = selectedTemplateState.itemStates.filter((item) => item.id !== itemId);
    await persistSelectedTemplateState({ itemStates: nextItemStates });

    if (selectedTemplateEditingLabelItemId === itemId) {
      cancelSelectedTemplateLabelEdit();
    }
  };

  const createTemplate = async () => {
    const baseName = "New Template";
    const existingNames = new Set(templates.map((template) => template.name));

    let nextName = baseName;
    let suffix = 1;

    while (existingNames.has(nextName)) {
      suffix += 1;
      nextName = `${baseName} ${suffix}`;
    }

    const defaultCommentItem: TemplateItemDefinition = {
      id: createNodeId(),
      name: "Textarea",
      type: "textarea",
      config: {
        label: "Comment",
        value: "",
      },
    };

    const newTemplate: TemplateDefinition = {
      id: createNodeId(),
      name: nextName,
      itemIds: [defaultCommentItem.id],
      itemStates: [defaultCommentItem],
    };

    const nextTemplates = [...templates, newTemplate];
    await persistDashboardState({ nextTemplates });

    setActiveTemplateId(newTemplate.id);
    setTemplateNameDraft(newTemplate.name);
    setTemplateDraftEntries([]);
    setTemplateDraftDirty(false);
    setTemplateAddMenuOpen(false);
    setSettingView("template-editor");
  };

  const deleteActiveTemplate = async () => {
    if (!activeTemplateId) {
      return;
    }

    const currentTemplate = templates.find((template) => template.id === activeTemplateId);
    const templateName = currentTemplate?.name ?? "this template";
    const shouldDelete = window.confirm(`Delete \"${templateName}\"?`);

    if (!shouldDelete) {
      return;
    }

    const nextTemplates = templates.filter((template) => template.id !== activeTemplateId);
    const nextNodes = clearTemplateBinding(treeNodes, activeTemplateId);

    await persistDashboardState({ nextNodes, nextTemplates });

    setActiveTemplateId(null);
    setTemplateDraftEntries([]);
    setTemplateDraftDirty(false);
    setTemplateAddMenuOpen(false);
    setTemplateNameDraft("");
    setSettingView("overview");
  };

  const confirmRemoveSelectedTemplateItem = (itemId: string, label: string) => {
    const displayLabel = label.trim() || "item";
    const shouldRemove = window.confirm(`Delete \"${displayLabel}\"?`);

    if (!shouldRemove) {
      return;
    }

    void removeSelectedTemplateItem(itemId);
  };

  const openTemplateEditor = (templateId: string) => {
    const template = templates.find((currentTemplate) => currentTemplate.id === templateId);

    if (!template) {
      return;
    }

    setActiveTemplateId(template.id);
    setTemplateNameDraft(template.name);
    setTemplateDraftEntries(template.itemStates.map((itemState) => ({ draftId: createNodeId(), itemState: cloneTemplateItemDefinition(itemState) })));
    setTemplateDraftDirty(false);
    setTemplateAddMenuOpen(false);
    setSettingView("template-editor");
  };

  const openTemplateItemEditor = (itemId: string) => {
    const item = templateItems.find((currentItem) => currentItem.id === itemId);

    if (!item) {
      return;
    }

    setActiveTemplateItemId(item.id);

    if (item.type === "episode") {
      setSettingView("episode-editor");
      return;
    }

    if (item.type === "textbox") {
      setSettingView("textbox-editor");
      return;
    }

    if (item.type === "textarea") {
      setSettingView("textarea-editor");
    }
  };

  const addTemplateItemToDraft = (itemId: string) => {
    const templateItem = templateItems.find((item) => item.id === itemId);

    if (!templateItem) {
      return;
    }

    setTemplateDraftEntries((current) => [...current, { draftId: createNodeId(), itemState: createTemplateItemState(templateItem) }]);
    setTemplateDraftDirty(true);
    setTemplateAddMenuOpen(false);
  };

  const removeTemplateDraftItem = (draftId: string) => {
    setTemplateDraftEntries((current) => current.filter((entry) => entry.draftId !== draftId));
    setTemplateDraftDirty(true);
  };

  const saveActiveTemplate = async () => {
    if (!activeTemplateId) {
      return;
    }

    const nextTemplates = templates.map((template) => (
      template.id === activeTemplateId
        ? { ...template, itemIds: templateDraftEntries.map((entry) => entry.itemState.id), itemStates: templateDraftEntries.map((entry) => cloneTemplateItemDefinition(entry.itemState)) }
        : template
    ));
    await persistDashboardState({ nextTemplates });
    setTemplateDraftDirty(false);
  };

  const updateTemplateEditorLabeledItemLabel = (draftId: string, nextLabel: string) => {
    setTemplateDraftEntries((current) => current.map((entry) => {
      if (entry.draftId !== draftId) {
        return entry;
      }

      if (entry.itemState.type === "episode") {
        const currentItem = entry.itemState;
        return {
          ...entry,
          itemState: {
            ...currentItem,
            config: {
              label: nextLabel,
              startEpisode: currentItem.config.startEpisode,
              endEpisode: currentItem.config.endEpisode,
              watchedEpisodes: [...currentItem.config.watchedEpisodes],
              favoriteEpisodes: [...currentItem.config.favoriteEpisodes],
              episodeComments: { ...currentItem.config.episodeComments },
            },
          },
        };
      }

      if (entry.itemState.type === "textbox") {
        const currentItem = entry.itemState;
        return {
          ...entry,
          itemState: {
            ...currentItem,
            config: {
              label: nextLabel,
              value: currentItem.config.value,
            },
          },
        };
      }

      if (entry.itemState.type === "textarea") {
        const currentItem = entry.itemState;
        return {
          ...entry,
          itemState: {
            ...currentItem,
            config: {
              label: nextLabel,
              value: currentItem.config.value,
            },
          },
        };
      }

      return entry;
    }));
    setTemplateDraftDirty(true);
  };

  const handleTemplateEditorItemDragStart = (event: DragEvent<HTMLLIElement>, draftId: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draftId);
    setDraggingTemplateEditorItemId(draftId);
  };

  const handleTemplateEditorItemDragOver = (event: DragEvent<HTMLLIElement>, draftId: string) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setTemplateEditorDropTargetId(draftId);
  };

  const handleTemplateEditorItemDrop = (event: DragEvent<HTMLLIElement>, targetDraftId: string) => {
    event.preventDefault();
    event.stopPropagation();

    const draggedItemId = event.dataTransfer.getData("text/plain") || draggingTemplateEditorItemId;
    setDraggingTemplateEditorItemId(null);
    setTemplateEditorDropTargetId(null);

    if (!draggedItemId || draggedItemId === targetDraftId) {
      return;
    }

    setTemplateDraftEntries((current) => reorderTemplateDraftEntries(current, draggedItemId, targetDraftId));
    setTemplateDraftDirty(true);
  };

  const handleTemplateEditorDragEnd = () => {
    setDraggingTemplateEditorItemId(null);
    setTemplateEditorDropTargetId(null);
  };

  const updateEpisodeTemplateItem = async (
    nextStartValue: string,
    nextLastValue: string,
    nextWatchedEpisodes: Set<number>,
    nextEpisodeComments: Record<string, string>,
    nextFavoriteEpisodes?: Set<number>,
  ) => {
    if (!activeTemplateItem || activeTemplateItem.type !== "episode") {
      return;
    }

    const nextStartEpisode = parseEpisodeInputValue(nextStartValue);
    const nextLastEpisode = parseEpisodeInputValue(nextLastValue);
    const hasValidRange = nextStartEpisode !== null && nextLastEpisode !== null && nextLastEpisode >= nextStartEpisode;
    const filteredWatchedEpisodes = hasValidRange ? filterEpisodeNumbersByRange(nextWatchedEpisodes, nextStartEpisode, nextLastEpisode) : [];
    const filteredEpisodeComments = hasValidRange ? filterEpisodeCommentsByRange(nextEpisodeComments, nextStartEpisode, nextLastEpisode) : {};
    const currentFavoriteEpisodes = nextFavoriteEpisodes ?? new Set(activeTemplateItem.config.favoriteEpisodes);
    const filteredFavoriteEpisodes = hasValidRange ? filterEpisodeNumbersByRange(currentFavoriteEpisodes, nextStartEpisode, nextLastEpisode) : [];

    const nextTemplateItems = templateItems.map((item) => {
      if (item.id !== activeTemplateItem.id || item.type !== "episode") {
        return item;
      }

      return {
        ...item,
        config: {
          label: item.config.label,
          startEpisode: nextStartEpisode,
          endEpisode: hasValidRange ? nextLastEpisode : null,
          watchedEpisodes: filteredWatchedEpisodes,
          favoriteEpisodes: filteredFavoriteEpisodes,
          episodeComments: filteredEpisodeComments,
        },
      };
    });

    await persistTemplateItems(nextTemplateItems);
  };

  const updateEpisodeTemplateItemLabel = async (nextLabel: string) => {
    if (!activeTemplateItem || activeTemplateItem.type !== "episode") {
      return;
    }

    const nextTemplateItems = templateItems.map((item) => {
      if (item.id !== activeTemplateItem.id || item.type !== "episode") {
        return item;
      }

      return {
        ...item,
        config: {
          ...item.config,
          label: nextLabel,
        },
      };
    });

    await persistTemplateItems(nextTemplateItems);
  };

  const updateTextboxTemplateItem = async (nextLabel: string, nextValue: string) => {
    if (!activeTemplateItem || activeTemplateItem.type !== "textbox") {
      return;
    }

    const nextTemplateItems = templateItems.map((item) => {
      if (item.id !== activeTemplateItem.id || item.type !== "textbox") {
        return item;
      }

      return {
        ...item,
        config: {
          label: nextLabel,
          value: nextValue,
        },
      };
    });

    await persistTemplateItems(nextTemplateItems);
  };

  const updateTextareaTemplateItem = async (nextLabel: string, nextValue: string) => {
    if (!activeTemplateItem || activeTemplateItem.type !== "textarea") {
      return;
    }

    const nextTemplateItems = templateItems.map((item) => {
      if (item.id !== activeTemplateItem.id || item.type !== "textarea") {
        return item;
      }

      return {
        ...item,
        config: {
          label: nextLabel,
          value: nextValue,
        },
      };
    });

    await persistTemplateItems(nextTemplateItems);
  };

  const handleEpisodeCheckboxChange = (episodeNumber: number, checked: boolean) => {
    const next = new Set(watchedEpisodes);

    if (checked) {
      next.add(episodeNumber);
    } else {
      next.delete(episodeNumber);
    }

    void updateEpisodeTemplateItem(startEpisode, lastEpisode, next, episodeComments, favoriteEpisodes);
  };

  const handleEpisodeFavoriteToggle = (episodeNumber: number) => {
    const nextFavoriteEpisodes = new Set(favoriteEpisodes);

    if (nextFavoriteEpisodes.has(episodeNumber)) {
      nextFavoriteEpisodes.delete(episodeNumber);
    } else {
      nextFavoriteEpisodes.add(episodeNumber);
    }

    void updateEpisodeTemplateItem(startEpisode, lastEpisode, watchedEpisodes, episodeComments, nextFavoriteEpisodes);
  };

  const closeEpisodeCommentDialog = () => {
    setEpisodeCommentDialog({
      open: false,
      source: "template-item",
      itemId: null,
      episodeNumber: null,
      comment: "",
    });
  };

  const saveEpisodeComment = async () => {
    if (!episodeCommentDialog.open || !episodeCommentDialog.itemId || episodeCommentDialog.episodeNumber === null) {
      return;
    }

    const commentKey = String(episodeCommentDialog.episodeNumber);
    const trimmedComment = episodeCommentDialog.comment.trim();

    if (episodeCommentDialog.source === "template-item") {
      if (!activeTemplateItem || activeTemplateItem.type !== "episode" || activeTemplateItem.id !== episodeCommentDialog.itemId) {
        closeEpisodeCommentDialog();
        return;
      }

      const nextEpisodeComments = { ...activeTemplateItem.config.episodeComments };
      if (trimmedComment) {
        nextEpisodeComments[commentKey] = trimmedComment;
      } else {
        delete nextEpisodeComments[commentKey];
      }

      await updateEpisodeTemplateItem(startEpisode, lastEpisode, watchedEpisodes, nextEpisodeComments, favoriteEpisodes);
      closeEpisodeCommentDialog();
      return;
    }

    if (!selectedTemplateState) {
      closeEpisodeCommentDialog();
      return;
    }

    const episodeItem = selectedTemplateState.itemStates.find((item) => item.id === episodeCommentDialog.itemId);

    if (!episodeItem || episodeItem.type !== "episode") {
      closeEpisodeCommentDialog();
      return;
    }

    const nextEpisodeComments = { ...episodeItem.config.episodeComments };
    if (trimmedComment) {
      nextEpisodeComments[commentKey] = trimmedComment;
    } else {
      delete nextEpisodeComments[commentKey];
    }

    const episodeStartValue = episodeItem.config.startEpisode === null ? "" : String(episodeItem.config.startEpisode);
    const episodeEndValue = episodeItem.config.endEpisode === null ? "" : String(episodeItem.config.endEpisode);

    await updateSelectedEpisodeItemState(
      episodeItem.id,
      episodeItem.config.label,
      episodeStartValue,
      episodeEndValue,
      new Set(episodeItem.config.watchedEpisodes),
      nextEpisodeComments,
      new Set(episodeItem.config.favoriteEpisodes),
    );
    closeEpisodeCommentDialog();
  };

  return (
    <main className="min-h-screen w-full px-4 py-6 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(0,72rem)_1fr]">
        <div className="hidden lg:block" aria-hidden="true" />

        <div className="flex min-h-0 flex-col">
          <div className="grid min-h-0 w-full flex-1 grid-cols-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:grid-cols-[260px_1fr]">
        <aside className="border-b border-zinc-200 bg-zinc-50 p-4 md:border-b-0 md:border-r" onContextMenu={(event) => openMenuAt(event, "root", null)}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Daily Note</h1>
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
                        onClick={() => selectNode(currentNode.id)}
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
                        {currentNode.iconKey ? <ItemIcon iconKey={currentNode.iconKey} /> : <FolderIcon open={isExpanded} />}
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
              {settingView === "overview" ? (
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-800">Setting</h2>
                    <p className="mt-1 text-sm text-zinc-500">Manage templates and template items for your notes.</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                      onClick={() => void createTemplate()}
                    >
                      Create template
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <section className="rounded-lg border border-zinc-200 p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Template list</h3>
                      <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                        {templates.map((template) => (
                          <li key={template.id} className="rounded-md bg-zinc-50 px-3 py-2">
                            <button
                              type="button"
                              className="w-full cursor-pointer text-left"
                              onDoubleClick={() => openTemplateEditor(template.id)}
                              title="Double click to open editor"
                            >
                              {template.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-lg border border-zinc-200 p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Template item list</h3>
                      <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                        {templateItems.map((item) => (
                          <li
                            key={item.id}
                            className="cursor-pointer rounded-md bg-zinc-50 px-3 py-2 transition hover:bg-zinc-100"
                            onDoubleClick={() => openTemplateItemEditor(item.id)}
                            title="Double click to open editor"
                          >
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </>
              ) : settingView === "template-editor" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={templateNameDraft}
                      onChange={(event) => setTemplateNameDraft(event.target.value)}
                      onBlur={() => void commitTemplateName()}
                      onKeyDown={handleTemplateNameKeyDown}
                      className="w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-2 text-xl font-semibold text-zinc-800 outline-none focus:border-zinc-400"
                      placeholder="Template name"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
                        onClick={() => void deleteActiveTemplate()}
                      >
                        Delete template
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                        onClick={() => setSettingView("overview")}
                      >
                        Back
                      </button>
                    </div>
                  </div>

                  <section className="rounded-lg border border-zinc-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Template items</h3>
                      <div className="relative">
                        <button
                          type="button"
                          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
                          onClick={() => setTemplateAddMenuOpen((current) => !current)}
                          disabled={templateItems.length === 0}
                        >
                          Add template item
                        </button>

                        {templateAddMenuOpen ? (
                          <div className="absolute right-0 top-full z-10 mt-2 min-w-44 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl">
                            {templateItems.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                                onClick={() => addTemplateItemToDraft(item.id)}
                              >
                                {item.name}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {draftTemplateItems.length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {draftTemplateItems.map(({ draftId, item }) => {
                          const isDropTarget = templateEditorDropTargetId === draftId;

                          return (
                            <li
                              key={draftId}
                              className={`rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 ${isDropTarget ? "bg-zinc-100" : ""}`}
                              draggable
                              onDragStart={(event) => handleTemplateEditorItemDragStart(event, draftId)}
                              onDragOver={(event) => handleTemplateEditorItemDragOver(event, draftId)}
                              onDrop={(event) => handleTemplateEditorItemDrop(event, draftId)}
                              onDragEnd={handleTemplateEditorDragEnd}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span>{item.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs uppercase tracking-wide text-zinc-400">Drag to reorder</span>
                                  <button
                                    type="button"
                                    className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
                                    onClick={() => removeTemplateDraftItem(draftId)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              {item.type === "episode" || item.type === "textbox" || item.type === "textarea" ? (
                                <div className="mt-3">
                                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Label</label>
                                  <input
                                    type="text"
                                    value={item.config.label}
                                    onChange={(event) => updateTemplateEditorLabeledItemLabel(draftId, event.target.value)}
                                    className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                                    placeholder="Label"
                                  />
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-zinc-500">Add template items to build this template.</p>
                    )}
                  </section>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="rounded-md border border-zinc-800 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-200 disabled:text-zinc-500"
                      onClick={() => void saveActiveTemplate()}
                      disabled={!templateDraftDirty}
                    >
                      Save template
                    </button>
                  </div>
                </div>
              ) : settingView === "episode-editor" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-zinc-800">Episode template item</h2>
                    <button
                      type="button"
                      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                      onClick={() => setSettingView("overview")}
                    >
                      Back
                    </button>
                  </div>

                  <section className="rounded-lg border border-zinc-200 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Label</h3>
                    <input
                      type="text"
                      value={episodeLabel}
                      onChange={(event) => void updateEpisodeTemplateItemLabel(event.target.value)}
                      className="mt-3 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                      placeholder="Episode"
                    />
                  </section>

                  <section className="rounded-lg border border-zinc-200 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Episode range</h3>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={startEpisode}
                        onChange={(event) => void updateEpisodeTemplateItem(event.target.value, lastEpisode, watchedEpisodes, episodeComments, favoriteEpisodes)}
                        className="w-32 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                        placeholder="Start"
                      />
                      <span className="text-sm font-medium text-zinc-500">-</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={lastEpisode}
                        onChange={(event) => void updateEpisodeTemplateItem(startEpisode, event.target.value, watchedEpisodes, episodeComments, favoriteEpisodes)}
                        className="w-32 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                        placeholder="End"
                      />
                    </div>
                    {!hasValidEpisodeRange ? (
                      <p className="mt-2 text-xs text-zinc-500">Enter valid episode numbers. Start can be 0, and end must be greater than or equal to start.</p>
                    ) : null}
                  </section>

                  <section className="rounded-lg border border-zinc-200 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Episode checklist</h3>
                    {generatedEpisodes.length > 0 ? (
                      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {generatedEpisodes.map((episodeNumber) => (
                          <li
                            key={episodeNumber}
                            className="rounded-md bg-zinc-50 px-3 py-2"
                            onDoubleClick={() => {
                              if (!activeTemplateItem || activeTemplateItem.type !== "episode") {
                                return;
                              }

                              setEpisodeCommentDialog({
                                open: true,
                                source: "template-item",
                                itemId: activeTemplateItem.id,
                                episodeNumber,
                                comment: episodeComments[String(episodeNumber)] ?? "",
                              });
                            }}
                            title="Double click to add comment"
                          >
                            <div className="flex items-center gap-2 text-sm text-zinc-700">
                              <input
                                type="checkbox"
                                checked={watchedEpisodes.has(episodeNumber)}
                                onChange={(event) => handleEpisodeCheckboxChange(episodeNumber, event.target.checked)}
                                aria-label={`Mark episode ${episodeNumber} watched`}
                                className="h-4 w-4 rounded border-zinc-300 text-zinc-700"
                              />
                              <span>{episodeNumber}</span>
                              <div className="ml-auto flex items-center gap-2">
                                {(episodeComments[String(episodeNumber)] ?? "").trim().length > 0 ? <CommentIcon /> : null}
                                <button
                                  type="button"
                                  className="text-xl leading-none text-zinc-400 transition hover:text-amber-500"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleEpisodeFavoriteToggle(episodeNumber);
                                  }}
                                  aria-label={`Toggle favorite for episode ${episodeNumber}`}
                                  title={favoriteEpisodes.has(episodeNumber) ? "Remove favorite" : "Mark as favorite"}
                                >
                                  {favoriteEpisodes.has(episodeNumber) ? "★" : "☆"}
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-zinc-500">Fill start and end episode numbers to generate items.</p>
                    )}
                  </section>
                </div>
              ) : settingView === "textbox-editor" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-zinc-800">Textbox template item</h2>
                    <button
                      type="button"
                      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                      onClick={() => setSettingView("overview")}
                    >
                      Back
                    </button>
                  </div>

                  <section className="rounded-lg border border-zinc-200 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Label</h3>
                    <input
                      type="text"
                      value={textboxLabel}
                      onChange={(event) => void updateTextboxTemplateItem(event.target.value, textboxValue)}
                      className="mt-3 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                      placeholder="Label"
                    />
                  </section>

                  <section className="rounded-lg border border-zinc-200 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Textbox</h3>
                    <label className="mt-3 block text-sm font-medium text-zinc-700">
                      {textboxLabel.trim() || "Label"}
                    </label>
                    <input
                      type="text"
                      value={textboxValue}
                      onChange={(event) => void updateTextboxTemplateItem(textboxLabel, event.target.value)}
                      className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                      placeholder="Enter text"
                    />
                  </section>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-zinc-800">Textarea template item</h2>
                    <button
                      type="button"
                      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                      onClick={() => setSettingView("overview")}
                    >
                      Back
                    </button>
                  </div>

                  <section className="rounded-lg border border-zinc-200 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Label</h3>
                    <input
                      type="text"
                      value={textareaLabel}
                      onChange={(event) => void updateTextareaTemplateItem(event.target.value, textareaValue)}
                      className="mt-3 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                      placeholder="Label"
                    />
                  </section>

                  <section className="rounded-lg border border-zinc-200 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Textarea</h3>
                    <label className="mt-3 block text-sm font-medium text-zinc-700">
                      {textareaLabel.trim() || "Label"}
                    </label>
                    <textarea
                      value={textareaValue}
                      onChange={(event) => void updateTextareaTemplateItem(textareaLabel, event.target.value)}
                      className="mt-2 min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                      placeholder="Enter text"
                    />
                  </section>
                </div>
              )}
            </div>
          ) : selectedTemplateNode && selectedTemplate && selectedTemplateState ? (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-800">{selectedNode?.name ?? selectedTemplate.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">Based on the {selectedTemplate.name} template.</p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
                    onClick={() => setSelectedTemplateAddMenuOpen((current) => !current)}
                    disabled={selectedTemplateAddableItems.length === 0}
                  >
                    Add template item
                  </button>

                  {selectedTemplateAddMenuOpen ? (
                    <div className="absolute right-0 top-full z-10 mt-2 min-w-44 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl">
                      {selectedTemplateAddableItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                          onClick={() => void addSelectedTemplateItem(item.id)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {selectedTemplateState.itemStates.map((item) => {
                if (item.type === "textbox") {
                  const textboxItemLabel = item.config.label.trim() || item.name;
                  const isEditingLabel = selectedTemplateEditingLabelItemId === item.id;

                  return (
                    <section key={item.id} className="rounded-lg border border-zinc-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        {isEditingLabel ? (
                          <input
                            autoFocus
                            type="text"
                            value={selectedTemplateEditingLabelValue}
                            onChange={(event) => setSelectedTemplateEditingLabelValue(event.target.value)}
                            onBlur={() => void commitSelectedTemplateLabelEdit()}
                            onKeyDown={handleSelectedTemplateLabelKeyDown}
                            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base font-semibold text-zinc-700 outline-none focus:border-zinc-400"
                            placeholder="Label"
                          />
                        ) : (
                          <label
                            className="block cursor-text text-base font-semibold text-zinc-700"
                            onDoubleClick={() => startSelectedTemplateLabelEdit(item.id, item.config.label)}
                            title="Double click to edit label"
                          >
                            {textboxItemLabel}
                          </label>
                        )}
                        <button
                          type="button"
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-zinc-300 text-sm leading-none text-zinc-600 transition hover:bg-zinc-100"
                          onClick={() => confirmRemoveSelectedTemplateItem(item.id, textboxItemLabel)}
                          aria-label={`Remove ${textboxItemLabel}`}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.config.value}
                        onChange={(event) => void updateSelectedTemplateItemState(item.id, (currentItem) => {
                          if (currentItem.type !== "textbox") {
                            return currentItem;
                          }

                          return {
                            ...currentItem,
                            config: {
                              ...currentItem.config,
                              value: event.target.value,
                            },
                          };
                        })}
                        className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                        placeholder={textboxItemLabel}
                      />
                    </section>
                  );
                }

                if (item.type === "textarea") {
                  const textareaItemLabel = item.config.label.trim() || item.name;
                  const isEditingLabel = selectedTemplateEditingLabelItemId === item.id;

                  return (
                    <section key={item.id} className="rounded-lg border border-zinc-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        {isEditingLabel ? (
                          <input
                            autoFocus
                            type="text"
                            value={selectedTemplateEditingLabelValue}
                            onChange={(event) => setSelectedTemplateEditingLabelValue(event.target.value)}
                            onBlur={() => void commitSelectedTemplateLabelEdit()}
                            onKeyDown={handleSelectedTemplateLabelKeyDown}
                            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base font-semibold text-zinc-700 outline-none focus:border-zinc-400"
                            placeholder="Label"
                          />
                        ) : (
                          <label
                            className="block cursor-text text-base font-semibold text-zinc-700"
                            onDoubleClick={() => startSelectedTemplateLabelEdit(item.id, item.config.label)}
                            title="Double click to edit label"
                          >
                            {textareaItemLabel}
                          </label>
                        )}
                        <button
                          type="button"
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-zinc-300 text-sm leading-none text-zinc-600 transition hover:bg-zinc-100"
                          onClick={() => confirmRemoveSelectedTemplateItem(item.id, textareaItemLabel)}
                          aria-label={`Remove ${textareaItemLabel}`}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                      <textarea
                        value={item.config.value}
                        onChange={(event) => void updateSelectedTemplateItemState(item.id, (currentItem) => {
                          if (currentItem.type !== "textarea") {
                            return currentItem;
                          }

                          return {
                            ...currentItem,
                            config: {
                              ...currentItem.config,
                              value: event.target.value,
                            },
                          };
                        })}
                        className="mt-2 min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                        placeholder={textareaItemLabel}
                      />
                    </section>
                  );
                }

                const episodeStart = item.config.startEpisode;
                const episodeEnd = item.config.endEpisode;
                const episodeStartValue = episodeStart === null ? "" : String(episodeStart);
                const episodeEndValue = episodeEnd === null ? "" : String(episodeEnd);
                const episodeHasValidRange = episodeStart !== null && episodeEnd !== null && episodeEnd >= episodeStart;
                const episodeNumbers = episodeHasValidRange ? Array.from({ length: episodeEnd - episodeStart + 1 }, (_, index) => episodeStart + index) : [];
                const checkedEpisodes = new Set(item.config.watchedEpisodes);
                const favoriteEpisodeSet = new Set(item.config.favoriteEpisodes);
                const checklistEpisodeComments = item.config.episodeComments;
                const currentEpisodeLabel = item.config.label.trim() || item.name;
                const isEditingLabel = selectedTemplateEditingLabelItemId === item.id;

                return (
                  <section key={item.id} className="rounded-lg border border-zinc-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      {isEditingLabel ? (
                        <input
                          autoFocus
                          type="text"
                          value={selectedTemplateEditingLabelValue}
                          onChange={(event) => setSelectedTemplateEditingLabelValue(event.target.value)}
                          onBlur={() => void commitSelectedTemplateLabelEdit()}
                          onKeyDown={handleSelectedTemplateLabelKeyDown}
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base font-semibold text-zinc-700 outline-none focus:border-zinc-400"
                          placeholder="Episode"
                        />
                      ) : (
                        <label
                          className="block cursor-text text-base font-semibold text-zinc-700"
                          onDoubleClick={() => startSelectedTemplateLabelEdit(item.id, item.config.label)}
                          title="Double click to edit label"
                        >
                          {currentEpisodeLabel}
                        </label>
                      )}
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-zinc-300 text-sm leading-none text-zinc-600 transition hover:bg-zinc-100"
                        onClick={() => confirmRemoveSelectedTemplateItem(item.id, currentEpisodeLabel)}
                        aria-label={`Remove ${currentEpisodeLabel}`}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={episodeStartValue}
                        onChange={(event) => void updateSelectedEpisodeItemState(item.id, item.config.label, event.target.value, episodeEndValue, checkedEpisodes)}
                        className="w-32 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                        placeholder="Start"
                      />
                      <span className="text-sm font-medium text-zinc-500">-</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={episodeEndValue}
                        onChange={(event) => void updateSelectedEpisodeItemState(item.id, item.config.label, episodeStartValue, event.target.value, checkedEpisodes)}
                        className="w-32 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
                        placeholder="End"
                      />
                    </div>
                    {!episodeHasValidRange ? (
                      <p className="mt-2 text-xs text-zinc-500">Enter valid episode numbers. Start can be 0, and end must be greater than or equal to start.</p>
                    ) : null}

                    <div className="mt-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Episode checklist</h4>
                      {episodeNumbers.length > 0 ? (
                        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {episodeNumbers.map((episodeNumber) => (
                            <li
                              key={episodeNumber}
                              className="rounded-md bg-zinc-50 px-3 py-2"
                              onDoubleClick={() => {
                                setEpisodeCommentDialog({
                                  open: true,
                                  source: "template-instance",
                                  itemId: item.id,
                                  episodeNumber,
                                  comment: checklistEpisodeComments[String(episodeNumber)] ?? "",
                                });
                              }}
                              title="Double click to add comment"
                            >
                              <div className="flex items-center gap-2 text-sm text-zinc-700">
                                <input
                                  type="checkbox"
                                  checked={checkedEpisodes.has(episodeNumber)}
                                  onChange={(event) => {
                                    const nextCheckedEpisodes = new Set(checkedEpisodes);

                                    if (event.target.checked) {
                                      nextCheckedEpisodes.add(episodeNumber);
                                    } else {
                                      nextCheckedEpisodes.delete(episodeNumber);
                                    }

                                    void updateSelectedEpisodeItemState(item.id, item.config.label, episodeStartValue, episodeEndValue, nextCheckedEpisodes, checklistEpisodeComments, favoriteEpisodeSet);
                                  }}
                                  aria-label={`Mark episode ${episodeNumber} watched`}
                                  className="h-4 w-4 rounded border-zinc-300 text-zinc-700"
                                />
                                <span>{episodeNumber}</span>
                                <div className="ml-auto flex items-center gap-2">
                                  {(checklistEpisodeComments[String(episodeNumber)] ?? "").trim().length > 0 ? <CommentIcon /> : null}
                                  <button
                                    type="button"
                                    className="text-xl leading-none text-zinc-400 transition hover:text-amber-500"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      const nextFavoriteEpisodes = new Set(favoriteEpisodeSet);

                                      if (nextFavoriteEpisodes.has(episodeNumber)) {
                                        nextFavoriteEpisodes.delete(episodeNumber);
                                      } else {
                                        nextFavoriteEpisodes.add(episodeNumber);
                                      }

                                      void updateSelectedEpisodeItemState(
                                        item.id,
                                        item.config.label,
                                        episodeStartValue,
                                        episodeEndValue,
                                        checkedEpisodes,
                                        checklistEpisodeComments,
                                        nextFavoriteEpisodes,
                                      );
                                    }}
                                    aria-label={`Toggle favorite for episode ${episodeNumber}`}
                                    title={favoriteEpisodeSet.has(episodeNumber) ? "Remove favorite" : "Mark as favorite"}
                                  >
                                    {favoriteEpisodeSet.has(episodeNumber) ? "★" : "☆"}
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-zinc-500">Fill start and end episode numbers to generate items.</p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : selectedNode?.kind === "item" ? (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-800">{selectedNode.name}</h2>
                <p className="mt-1 text-sm text-zinc-500">This item does not have template content yet.</p>
              </div>
            </div>
          ) : null}
        </section>
          </div>
        </div>

        <div className="flex items-start justify-end">
          <form action={logout}>
            <button type="submit" className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100">
              Logout
            </button>
          </form>
        </div>
      </div>

      {episodeCommentDialog.open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4" onClick={closeEpisodeCommentDialog}>
          <div
            className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-4 shadow-2xl"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <h3 className="text-base font-semibold text-zinc-800">
              Episode {episodeCommentDialog.episodeNumber} comment
            </h3>
            <p className="mt-1 text-xs text-zinc-500">Enter a comment for this checklist item.</p>
            <textarea
              autoFocus
              value={episodeCommentDialog.comment}
              onChange={(event) =>
                setEpisodeCommentDialog((current) => ({
                  ...current,
                  comment: event.target.value,
                }))
              }
              rows={4}
              className="mt-3 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
              placeholder="Write comment..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                onClick={closeEpisodeCommentDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md border border-zinc-800 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700"
                onClick={() => void saveEpisodeComment()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {menu.open ? (
        <div className="fixed z-50 min-w-44 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl" style={{ left: menu.x, top: menu.y }}>
          <div className="relative" onMouseEnter={() => setCreateOpen(true)} onMouseLeave={() => setCreateOpen(false)}>
            <button type="button" className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100">
              <span>Create</span>
              <span className="text-zinc-500">›</span>
            </button>

            {createOpen ? (
              <div className="absolute left-full top-0 ml-1 min-w-40 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl">
                <button
                  type="button"
                  className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
                  onClick={createFolder}
                  disabled={(() => {
                    if (!menu.targetId) {
                      return false;
                    }

                    const targetNode = findNodeById(treeNodes, menu.targetId);
                    return !targetNode || targetNode.kind !== "folder";
                  })()}
                >
                  <FolderIcon />
                  <span className="ml-2">Folder</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
                  onClick={createTemplateItem}
                  disabled={(() => {
                    if (!menu.targetId) {
                      return true;
                    }

                    const targetNode = findNodeById(treeNodes, menu.targetId);
                    if (!targetNode || targetNode.kind !== "folder") {
                      return true;
                    }

                    return !findTemplateForNode(treeNodes, menu.targetId, templates);
                  })()}
                >
                  <ItemIcon iconKey="template" />
                  <span className="ml-2">Item</span>
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
