export type ExplorerNodeKind = "folder" | "item";

export type ExplorerIconKey = "music" | "game" | "comic" | "movie" | "book" | "anime";

export type ExplorerNode = {
  id: string;
  name: string;
  kind: ExplorerNodeKind;
  iconKey?: ExplorerIconKey;
  children?: ExplorerNode[];
};

export type ExplorerState = {
  nodes: ExplorerNode[];
};

export const DEFAULT_EXPLORER_STATE: ExplorerState = {
  nodes: [
    { id: "music", name: "Music", kind: "item", iconKey: "music" },
    { id: "game", name: "Game", kind: "item", iconKey: "game" },
    { id: "comic", name: "Comic", kind: "item", iconKey: "comic" },
    {
      id: "drama",
      name: "Drama",
      kind: "folder",
      children: [
        { id: "japan", name: "Japan", kind: "folder", children: [] },
        { id: "korea", name: "Korea", kind: "folder", children: [] },
      ],
    },
    { id: "movie", name: "Movie", kind: "item", iconKey: "movie" },
    { id: "book", name: "Book", kind: "item", iconKey: "book" },
    { id: "anime", name: "Anime", kind: "item", iconKey: "anime" },
  ],
};

function normalizeNode(input: unknown): ExplorerNode | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const source = input as Partial<ExplorerNode>;
  const id = typeof source.id === "string" && source.id.trim() ? source.id.trim() : "";
  const name = typeof source.name === "string" && source.name.trim() ? source.name.trim() : "";
  const kind: ExplorerNodeKind = source.kind === "folder" ? "folder" : "item";

  if (!id || !name) {
    return null;
  }

  const iconKey =
    source.iconKey === "music" ||
    source.iconKey === "game" ||
    source.iconKey === "comic" ||
    source.iconKey === "movie" ||
    source.iconKey === "book" ||
    source.iconKey === "anime"
      ? source.iconKey
      : undefined;

  const children = Array.isArray(source.children)
    ? source.children.map((child) => normalizeNode(child)).filter((child): child is ExplorerNode => Boolean(child))
    : [];

  return {
    id,
    name,
    kind,
    iconKey,
    children: kind === "folder" ? children : [],
  };
}

export function normalizeExplorerState(input: Partial<ExplorerState> | null | undefined): ExplorerState {
  if (!input || !Array.isArray(input.nodes)) {
    return DEFAULT_EXPLORER_STATE;
  }

  const nodes = input.nodes
    .map((node) => normalizeNode(node))
    .filter((node): node is ExplorerNode => Boolean(node));

  if (nodes.length === 0) {
    return DEFAULT_EXPLORER_STATE;
  }

  return { nodes };
}
