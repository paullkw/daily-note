export type ExplorerNodeKind = "folder" | "item";

export type ExplorerIconKey = "music" | "game" | "comic" | "movie" | "book" | "anime" | "setting" | "template";
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
  episodeComments?: unknown;
};

type TextboxTemplateItemConfigInput = {
  label?: unknown;
  value?: unknown;
};

const DEFAULT_TEMPLATES: TemplateDefinition[] = [{ id: "template-drama", name: "Drama", itemIds: [], itemStates: [] }];

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
    SETTING_NODE,
  ],
  templates: DEFAULT_TEMPLATES,
  templateItems: DEFAULT_TEMPLATE_ITEMS,
};

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

  return {
    id,
    name,
    kind,
    iconKey,
    templateId,
    templateState: normalizeTemplateInstanceState(source.templateState),
    children: kind === "folder" ? children : [],
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

  const nodes = input.nodes
    .map((node) => normalizeNode(node))
    .filter((node): node is ExplorerNode => Boolean(node));

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
    : [];

  for (const defaultTemplate of cloneDefaultTemplates()) {
    if (!templates.some((template) => template.id === defaultTemplate.id)) {
      templates.push(defaultTemplate);
    }
  }

  return { nodes, templates, templateItems };
}
