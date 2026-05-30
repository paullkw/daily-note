export type ExplorerNodeKind = "folder" | "item";

export type ExplorerIconKey = "music" | "game" | "comic" | "movie" | "book" | "anime" | "drama" | "setting" | "template";
export type TemplateItemType = "episode" | "textbox" | "textarea";

const SETTING_NODE_ID = "setting";

const SETTING_NODE: ExplorerNode = {
  id: SETTING_NODE_ID,
  name: "Setting",
  kind: "item",
  iconKey: "setting",
};

export type ExplorerNode = {
  id: string;
  name: string;
  kind: ExplorerNodeKind;
  iconKey?: ExplorerIconKey;
  templateId?: string;
  templateState?: TemplateInstanceState;
  children?: ExplorerNode[];
};

export type ExplorerState = {
  nodes: ExplorerNode[];
  templates: TemplateDefinition[];
  templateItems: TemplateItemDefinition[];
};

export type TemplateDefinition = {
  id: string;
  name: string;
  itemIds: string[];
  itemStates: TemplateItemDefinition[];
};

export type EpisodeTemplateItemDefinition = {
  id: string;
  name: string;
  type: "episode";
  config: {
    label: string;
    startEpisode: number | null;
    endEpisode: number | null;
    watchedEpisodes: number[];
    favoriteEpisodes: number[];
    episodeComments: Record<string, string>;
  };
};

export type TextboxTemplateItemDefinition = {
  id: string;
  name: string;
  type: "textbox";
  config: {
    label: string;
    value: string;
  };
};

export type TextareaTemplateItemDefinition = {
  id: string;
  name: string;
  type: "textarea";
  config: {
    label: string;
    value: string;
  };
};

export type TemplateItemDefinition = EpisodeTemplateItemDefinition | TextboxTemplateItemDefinition | TextareaTemplateItemDefinition;

export type TemplateInstanceState = {
  itemStates: TemplateItemDefinition[];
};

type EpisodeTemplateItemConfigInput = {
  label?: unknown;
  startEpisode?: unknown;
  endEpisode?: unknown;
  watchedEpisodes?: unknown;
  favoriteEpisodes?: unknown;
  episodeComments?: unknown;
};

type TextboxTemplateItemConfigInput = {
  label?: unknown;
  value?: unknown;
};

function createDefaultTemplateCommentItem(templateId: string): TemplateItemDefinition {
  return {
    id: `${templateId}-comment`,
    name: "Textarea",
    type: "textarea",
    config: {
      label: "Comment",
      value: "",
    },
  };
}

function createDefaultTemplateEpisodeItem(templateId: string, label: string): TemplateItemDefinition {
  const labelSegment = label.trim().toLowerCase().replace(/\s+/g, "-");

  return {
    id: `${templateId}-episode-${labelSegment}`,
    name: "Episode",
    type: "episode",
    config: {
      label,
      startEpisode: null,
      endEpisode: null,
      watchedEpisodes: [],
      favoriteEpisodes: [],
      episodeComments: {},
    },
  };
}

function ensureTemplateHasDefaultCommentItem(template: TemplateDefinition): TemplateDefinition {
  const targetTemplateIds = new Set([
    "template-music",
    "template-game",
    "template-comic",
    "template-drama",
    "template-movie",
    "template-book",
    "template-anime",
  ]);

  if (!targetTemplateIds.has(template.id)) {
    return template;
  }

  const hasCommentTextarea = template.itemStates.some((item) => item.type === "textarea" && item.config.label.trim().toLowerCase() === "comment");

  if (hasCommentTextarea) {
    return template;
  }

  const defaultCommentItem = createDefaultTemplateCommentItem(template.id);

  return {
    ...template,
    itemIds: [...template.itemIds, defaultCommentItem.id],
    itemStates: [...template.itemStates, defaultCommentItem],
  };
}

function ensureDramaAnimeTemplateHasSeasonOneEpisode(template: TemplateDefinition): TemplateDefinition {
  if (template.id !== "template-drama" && template.id !== "template-anime") {
    return template;
  }

  const hasSeasonOneEpisode = template.itemStates.some((item) => item.type === "episode" && item.config.label.trim().toLowerCase() === "season 1");

  if (hasSeasonOneEpisode) {
    return template;
  }

  const seasonOneEpisodeItem = createDefaultTemplateEpisodeItem(template.id, "Season 1");

  return {
    ...template,
    itemIds: [...template.itemIds, seasonOneEpisodeItem.id],
    itemStates: [...template.itemStates, seasonOneEpisodeItem],
  };
}

function ensureComicTemplateHasChapterEpisode(template: TemplateDefinition): TemplateDefinition {
  if (template.id !== "template-comic") {
    return template;
  }

  const hasChapterEpisode = template.itemStates.some((item) => item.type === "episode" && item.config.label.trim().toLowerCase() === "chapter");

  if (hasChapterEpisode) {
    return template;
  }

  const chapterEpisodeItem = createDefaultTemplateEpisodeItem(template.id, "Chapter");

  return {
    ...template,
    itemIds: [...template.itemIds, chapterEpisodeItem.id],
    itemStates: [...template.itemStates, chapterEpisodeItem],
  };
}

const DEFAULT_TEMPLATES: TemplateDefinition[] = [
  { id: "template-music", name: "Music", itemIds: ["template-music-comment"], itemStates: [createDefaultTemplateCommentItem("template-music")] },
  { id: "template-game", name: "Game", itemIds: ["template-game-comment"], itemStates: [createDefaultTemplateCommentItem("template-game")] },
  {
    id: "template-comic",
    name: "Comic",
    itemIds: ["template-comic-comment", "template-comic-episode-chapter"],
    itemStates: [
      createDefaultTemplateCommentItem("template-comic"),
      createDefaultTemplateEpisodeItem("template-comic", "Chapter"),
    ],
  },
  {
    id: "template-drama",
    name: "Drama",
    itemIds: ["template-drama-comment", "template-drama-episode-season-1"],
    itemStates: [
      createDefaultTemplateCommentItem("template-drama"),
      createDefaultTemplateEpisodeItem("template-drama", "Season 1"),
    ],
  },
  { id: "template-movie", name: "Movie", itemIds: ["template-movie-comment"], itemStates: [createDefaultTemplateCommentItem("template-movie")] },
  { id: "template-book", name: "Book", itemIds: ["template-book-comment"], itemStates: [createDefaultTemplateCommentItem("template-book")] },
  {
    id: "template-anime",
    name: "Anime",
    itemIds: ["template-anime-comment", "template-anime-episode-season-1"],
    itemStates: [
      createDefaultTemplateCommentItem("template-anime"),
      createDefaultTemplateEpisodeItem("template-anime", "Season 1"),
    ],
  },
];

const DEFAULT_TEMPLATE_ITEMS: TemplateItemDefinition[] = [
  {
    id: "template-item-episode",
    name: "Episode",
    type: "episode",
    config: {
      label: "Episode",
      startEpisode: null,
      endEpisode: null,
      watchedEpisodes: [],
      favoriteEpisodes: [],
      episodeComments: {},
    },
  },
  {
    id: "template-item-textbox",
    name: "Textbox",
    type: "textbox",
    config: {
      label: "Label",
      value: "",
    },
  },
  {
    id: "template-item-textarea",
    name: "Textarea",
    type: "textarea",
    config: {
      label: "Label",
      value: "",
    },
  },
];

export const DEFAULT_EXPLORER_STATE: ExplorerState = {
  nodes: [
    { id: "music", name: "Music", kind: "folder", iconKey: "music", children: [] },
    { id: "game", name: "Game", kind: "folder", iconKey: "game", children: [] },
    { id: "comic", name: "Comic", kind: "folder", iconKey: "comic", children: [] },
    {
      id: "drama",
      name: "Drama",
      kind: "folder",
      iconKey: "drama",
      children: [
        { id: "japan", name: "Japan", kind: "folder", children: [] },
        { id: "korea", name: "Korea", kind: "folder", children: [] },
      ],
    },
    { id: "movie", name: "Movie", kind: "folder", iconKey: "movie", children: [] },
    { id: "book", name: "Book", kind: "folder", iconKey: "book", children: [] },
    { id: "anime", name: "Anime", kind: "folder", iconKey: "anime", children: [] },
    SETTING_NODE,
  ],
  templates: DEFAULT_TEMPLATES,
  templateItems: DEFAULT_TEMPLATE_ITEMS,
};

const PARENT_NODE_ICON_KEYS: Record<string, ExplorerIconKey> = {
  music: "music",
  game: "game",
  comic: "comic",
  drama: "drama",
  movie: "movie",
  book: "book",
  anime: "anime",
};

const CATEGORY_PARENT_NODE_IDS = new Set(Object.keys(PARENT_NODE_ICON_KEYS));

function normalizeParentCategoryNodes(nodes: ExplorerNode[]): ExplorerNode[] {
  return nodes.map((node) => {
    const nextChildren = node.children ? normalizeParentCategoryNodes(node.children) : node.children;

    if (!CATEGORY_PARENT_NODE_IDS.has(node.id)) {
      return {
        ...node,
        children: nextChildren,
      };
    }

    return {
      ...node,
      kind: "folder",
      children: nextChildren ?? [],
    };
  });
}

function cloneDefaultTemplates(): TemplateDefinition[] {
  return DEFAULT_TEMPLATES.map((template) => ({
    ...template,
    itemIds: [...template.itemIds],
    itemStates: template.itemStates.map((itemState) => cloneTemplateItemDefinition(itemState)),
  }));
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

function cloneDefaultTemplateItems(): TemplateItemDefinition[] {
  return DEFAULT_TEMPLATE_ITEMS.map((item) => cloneTemplateItemDefinition(item));
}

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
    source.iconKey === "anime" ||
    source.iconKey === "setting" ||
    source.iconKey === "template"
      ? source.iconKey
      : undefined;
  const templateId = typeof source.templateId === "string" && source.templateId.trim() ? source.templateId.trim() : undefined;

  const children = Array.isArray(source.children)
    ? source.children.map((child) => normalizeNode(child)).filter((child): child is ExplorerNode => Boolean(child))
    : [];

  const forceFolder = CATEGORY_PARENT_NODE_IDS.has(id);
  const forcedIconKey = PARENT_NODE_ICON_KEYS[id];

  return {
    id,
    name,
    kind: forceFolder ? "folder" : kind,
    iconKey: forcedIconKey ?? iconKey,
    templateId,
    templateState: normalizeTemplateInstanceState(source.templateState),
    children: forceFolder || kind === "folder" ? children : [],
  };
}

function normalizeTemplate(input: unknown): TemplateDefinition | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const source = input as Partial<TemplateDefinition>;
  const id = typeof source.id === "string" && source.id.trim() ? source.id.trim() : "";
  const name = typeof source.name === "string" && source.name.trim() ? source.name.trim() : "";
  const itemIds = Array.isArray(source.itemIds) ? source.itemIds.filter((itemId): itemId is string => typeof itemId === "string" && itemId.trim().length > 0) : [];
  const itemStates = Array.isArray(source.itemStates)
    ? source.itemStates.map((item) => normalizeTemplateItem(item)).filter((item): item is TemplateItemDefinition => Boolean(item))
    : [];

  if (!id || !name) {
    return null;
  }

  return { id, name, itemIds, itemStates };
}

function normalizeTemplateItem(input: unknown): TemplateItemDefinition | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const source = input as Partial<TemplateItemDefinition> & { config?: Record<string, unknown> };
  const id = typeof source.id === "string" && source.id.trim() ? source.id.trim() : "";
  const name = typeof source.name === "string" && source.name.trim() ? source.name.trim() : "";

  if (!id || !name) {
    return null;
  }

  if (source.type === "episode") {
    const config = (source.config ?? {}) as EpisodeTemplateItemConfigInput;
    const label = typeof config.label === "string" ? config.label : "Episode";
    const startEpisode = typeof config.startEpisode === "number" && Number.isInteger(config.startEpisode) && config.startEpisode >= 0 ? config.startEpisode : null;
    const endEpisode = typeof config.endEpisode === "number" && Number.isInteger(config.endEpisode) && endEpisodeIsValid(config.endEpisode, startEpisode) ? config.endEpisode : null;
    const watchedEpisodes = Array.isArray(config.watchedEpisodes)
      ? config.watchedEpisodes.filter((episode: unknown): episode is number => typeof episode === "number" && Number.isInteger(episode) && episode >= 0)
      : [];
    const favoriteEpisodes = Array.isArray(config.favoriteEpisodes)
      ? config.favoriteEpisodes.filter((episode: unknown): episode is number => typeof episode === "number" && Number.isInteger(episode) && episode >= 0)
      : [];
    const episodeComments = normalizeEpisodeComments(config.episodeComments);

    return {
      id,
      name,
      type: "episode",
      config: {
        label,
        startEpisode,
        endEpisode,
        watchedEpisodes,
        favoriteEpisodes,
        episodeComments,
      },
    };
  }

  if (source.type === "textbox" || source.type === "textarea") {
    const config = (source.config ?? {}) as TextboxTemplateItemConfigInput;

    return {
      id,
      name,
      type: source.type,
      config: {
        label: typeof config.label === "string" ? config.label : "Label",
        value: typeof config.value === "string" ? config.value : "",
      },
    };
  }

  return null;
}

function normalizeEpisodeComments(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object") {
    return {};
  }

  const entries = Object.entries(input as Record<string, unknown>)
    .flatMap(([key, value]) => {
      if (typeof value !== "string") {
        return [];
      }

      const parsedEpisode = Number(key);
      const trimmedValue = value.trim();

      if (!Number.isInteger(parsedEpisode) || parsedEpisode < 0 || trimmedValue.length === 0) {
        return [];
      }

      return [[key, trimmedValue] as const];
    });

  return Object.fromEntries(entries);
}

function normalizeTemplateInstanceState(input: unknown): TemplateInstanceState | undefined {
  if (!input || typeof input !== "object") {
    return undefined;
  }

  const source = input as { itemStates?: unknown };
  if (!Array.isArray(source.itemStates)) {
    return undefined;
  }

  const itemStates = source.itemStates
    .map((item) => normalizeTemplateItem(item))
    .filter((item): item is TemplateItemDefinition => Boolean(item));

  if (itemStates.length === 0) {
    return undefined;
  }

  return { itemStates };
}

function endEpisodeIsValid(endEpisode: number, startEpisode: number | null): boolean {
  if (!Number.isInteger(endEpisode) || endEpisode < 0) {
    return false;
  }

  if (startEpisode === null) {
    return true;
  }

  return endEpisode >= startEpisode;
}

export function normalizeExplorerState(input: Partial<ExplorerState> | null | undefined): ExplorerState {
  if (!input || !Array.isArray(input.nodes)) {
    return {
      nodes: [...DEFAULT_EXPLORER_STATE.nodes],
      templates: cloneDefaultTemplates(),
      templateItems: cloneDefaultTemplateItems(),
    };
  }

  const nodes = normalizeParentCategoryNodes(
    input.nodes
    .map((node) => normalizeNode(node))
    .filter((node): node is ExplorerNode => Boolean(node))
  );

  if (nodes.length === 0) {
    return {
      nodes: [...DEFAULT_EXPLORER_STATE.nodes],
      templates: cloneDefaultTemplates(),
      templateItems: cloneDefaultTemplateItems(),
    };
  }

  if (!nodes.some((node) => node.id === SETTING_NODE_ID)) {
    nodes.push(SETTING_NODE);
  }

  const templateItems = Array.isArray(input.templateItems)
    ? input.templateItems
        .map((item) => normalizeTemplateItem(item))
        .filter((item): item is TemplateItemDefinition => Boolean(item))
    : [];

  for (const defaultItem of cloneDefaultTemplateItems()) {
    if (!templateItems.some((item) => item.id === defaultItem.id)) {
      templateItems.push(defaultItem);
    }
  }

  const availableItemIds = new Set(templateItems.map((item) => item.id));

  const templates = Array.isArray(input.templates)
    ? input.templates
        .map((template) => normalizeTemplate(template))
        .filter((template): template is TemplateDefinition => Boolean(template))
        .map((template) => ({
          ...template,
          itemIds: template.itemIds.filter((itemId) => availableItemIds.has(itemId)),
          itemStates:
            template.itemStates.length > 0
              ? template.itemStates.map((itemState) => cloneTemplateItemDefinition(itemState))
              : template.itemIds
                  .filter((itemId) => availableItemIds.has(itemId))
                  .map((itemId) => templateItems.find((item) => item.id === itemId) ?? null)
                  .filter((item): item is TemplateItemDefinition => Boolean(item))
                  .map((item) => cloneTemplateItemDefinition(item)),
            }))
                .map((template) => ensureTemplateHasDefaultCommentItem(template))
                .map((template) => ensureComicTemplateHasChapterEpisode(template))
                .map((template) => ensureDramaAnimeTemplateHasSeasonOneEpisode(template))
    : [];

  for (const defaultTemplate of cloneDefaultTemplates()) {
    if (!templates.some((template) => template.id === defaultTemplate.id)) {
      templates.push(defaultTemplate);
    }
  }

  return { nodes, templates, templateItems };
}
