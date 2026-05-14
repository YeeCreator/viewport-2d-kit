import { computed, defineComponent, h, ref, type PropType } from 'vue';
import { Viewport2DCanvas } from './Viewport2DCanvas';

export type ViewportMainUiViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ViewportMainUiNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tone?: 'blue' | 'green' | 'gold' | 'pink' | 'gray';
};

export type ViewportMainUiEdge = {
  source: string;
  target: string;
};

export type ViewportMainUiEditorPayload = {
  title?: string;
  description?: string;
  viewBox?: ViewportMainUiViewBox;
  minScale?: number;
  maxScale?: number;
  paddingPx?: number;
  nodes?: ViewportMainUiNode[];
  edges?: ViewportMainUiEdge[];
};

export type MainUiLikeEditorContext = {
  editor?: {
    payload?: Record<string, unknown>;
  };
  tab?: {
    title?: string;
  };
};

const DEFAULT_VIEWBOX: ViewportMainUiViewBox = {
  x: -160,
  y: -120,
  width: 680,
  height: 420,
};

const DEFAULT_NODES: ViewportMainUiNode[] = [
  { id: 'source', label: 'Source', x: -20, y: 20, width: 128, height: 56, tone: 'blue' },
  { id: 'editor', label: 'Viewport editor', x: 200, y: 100, width: 160, height: 56, tone: 'green' },
  { id: 'runtime', label: 'Main-ui tab', x: 380, y: -30, width: 138, height: 56, tone: 'gold' },
  { id: 'overlay', label: 'Overlay', x: 140, y: 240, width: 120, height: 56, tone: 'pink' },
];

const DEFAULT_EDGES: ViewportMainUiEdge[] = [
  { source: 'source', target: 'editor' },
  { source: 'editor', target: 'runtime' },
  { source: 'editor', target: 'overlay' },
];

const TONE_FILL: Record<string, string> = {
  blue: '#d9ebff',
  green: '#dcfce7',
  gold: '#fef3c7',
  pink: '#fce7f3',
  gray: '#e5e7eb',
};

const ROOT_STYLE = {
  width: '100%',
  height: '100%',
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr)',
  gap: '8px',
  padding: '10px',
  boxSizing: 'border-box',
};

const HEADER_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '8px',
};

const STAGE_STYLE = {
  minHeight: 0,
  border: '1px solid #d7dbe3',
  borderRadius: '8px',
  overflow: 'hidden',
  background: '#f8fafc',
};

const TITLE_STYLE = {
  margin: 0,
  fontSize: '14px',
  fontWeight: '600',
};

const DESCRIPTION_STYLE = {
  margin: '4px 0 0',
  fontSize: '12px',
  color: '#475569',
};

const BADGE_STYLE = {
  fontSize: '11px',
  color: '#334155',
  background: '#e2e8f0',
  borderRadius: '999px',
  padding: '4px 8px',
  whiteSpace: 'nowrap',
};

export const ViewportMainUiEditor = defineComponent({
  name: 'ViewportMainUiEditor',
  props: {
    context: {
      type: Object as PropType<MainUiLikeEditorContext>,
      required: true,
    },
  },
  setup(props) {
    const pointerStatus = ref('pointer: idle');

    const payload = computed(() => {
      const raw = props.context?.editor?.payload;
      return (raw ?? {}) as ViewportMainUiEditorPayload;
    });

    const title = computed(() => {
      if (payload.value.title) return payload.value.title;
      const hostTitle = props.context?.tab?.title;
      if (hostTitle && hostTitle.trim().length > 0) {
        return `${hostTitle} viewport`;
      }
      return 'Viewport 2D editor';
    });
    const description = computed(
      () => payload.value.description ?? 'Vue + core viewport surface that can be mounted in any main-ui tab.',
    );

    const viewBox = computed(() => payload.value.viewBox ?? DEFAULT_VIEWBOX);
    const minScale = computed(() => payload.value.minScale ?? 0.25);
    const maxScale = computed(() => payload.value.maxScale ?? 4);
    const paddingPx = computed(() => payload.value.paddingPx ?? 56);

    const nodes = computed(() => {
      if (Array.isArray(payload.value.nodes) && payload.value.nodes.length > 0) {
        return payload.value.nodes;
      }
      return DEFAULT_NODES;
    });

    const edges = computed(() => {
      if (Array.isArray(payload.value.edges) && payload.value.edges.length > 0) {
        return payload.value.edges;
      }
      return DEFAULT_EDGES;
    });

    const nodesById = computed(() => {
      const map = new Map<string, ViewportMainUiNode>();
      for (const node of nodes.value) {
        map.set(node.id, node);
      }
      return map;
    });

    const drawableEdges = computed(() => {
      return edges.value.flatMap((edge) => {
        const source = nodesById.value.get(edge.source);
        const target = nodesById.value.get(edge.target);
        if (!source || !target) {
          return [] as Array<{ source: ViewportMainUiNode; target: ViewportMainUiNode }>;
        }
        return [{ source, target }];
      });
    });

    return () =>
      h('div', { style: ROOT_STYLE }, [
        h('div', { style: HEADER_STYLE }, [
          h('div', [h('h3', { style: TITLE_STYLE }, title.value), h('p', { style: DESCRIPTION_STYLE }, description.value)]),
          h('span', { style: BADGE_STYLE }, pointerStatus.value),
        ]),
        h(
          'div',
          { style: STAGE_STYLE },
          h(
            Viewport2DCanvas,
            {
              viewBox: viewBox.value,
              minScale: minScale.value,
              maxScale: maxScale.value,
              paddingPx: paddingPx.value,
            },
            {
              default: ({ width, height, cameraTransform }: { width: number; height: number; cameraTransform: string }) =>
                h(
                  'svg',
                  {
                    width,
                    height,
                    viewBox: `0 0 ${width} ${height}`,
                    style: { display: 'block' },
                    onPointerdown: (event: PointerEvent) => {
                      pointerStatus.value = `pointer: ${Math.round(event.offsetX)}, ${Math.round(event.offsetY)}`;
                    },
                  },
                  [
                    h('rect', {
                      width,
                      height,
                      fill: '#f8fafc',
                    }),
                    h(
                      'g',
                      {
                        transform: cameraTransform,
                      },
                      [
                        ...drawableEdges.value.map((edge) =>
                          h('line', {
                            x1: edge.source.x + edge.source.width / 2,
                            y1: edge.source.y + edge.source.height / 2,
                            x2: edge.target.x + edge.target.width / 2,
                            y2: edge.target.y + edge.target.height / 2,
                            stroke: '#64748b',
                            'stroke-width': 2,
                          }),
                        ),
                        ...nodes.value.map((node) =>
                          h('g', { transform: `translate(${node.x} ${node.y})` }, [
                            h('rect', {
                              width: node.width,
                              height: node.height,
                              rx: 8,
                              fill: TONE_FILL[node.tone ?? 'gray'] ?? TONE_FILL.gray,
                              stroke: '#475569',
                              'stroke-width': 1,
                            }),
                            h(
                              'text',
                              {
                                x: node.width / 2,
                                y: node.height / 2 + 5,
                                'text-anchor': 'middle',
                                style: {
                                  fontSize: '12px',
                                  fill: '#1e293b',
                                  userSelect: 'none',
                                },
                              },
                              node.label,
                            ),
                          ]),
                        ),
                      ],
                    ),
                  ],
                ),
            },
          ),
        ),
      ]);
  },
});

export const VIEWPORT_MAIN_UI_EDITOR_KIND = 'viewport-2d-editor';
export const VIEWPORT_MAIN_UI_RENDERER_KEY = 'viewport-main-ui-editor';

export type ViewportMainUiCompatibleEditorDescriptor = {
  kind: string;
  title: string;
  description?: string;
  icon?: string;
  rendererKey: string;
  createDefaultPayload?: () => Record<string, unknown>;
  capability: {
    allowCreate: boolean;
    allowDuplicate: boolean;
    allowMultipleInstances: boolean;
    allowMultipleSurfacesPerInstance: boolean;
    allowClose: boolean;
    allowReorderInGroup: boolean;
    allowMoveAcrossGroups: boolean;
    allowSplitDrop: boolean;
    allowPopoutWindow: boolean;
    allowFloatingWindow: boolean;
    allowModalOverlay: boolean;
    allowMirrorDisplay: boolean;
    launcherVisibility: 'visible' | 'hidden' | 'hidden-when-opened';
  };
  presentation: {
    defaultSurface: 'tab' | 'modal-overlay';
    modalVariant?: 'centered-modal' | 'anchored-popover';
    canPromoteModalToTab: boolean;
  };
  availability: {
    allowedWorkspaceIds: string[];
  };
};

export type ViewportMainUiEditorDescriptorOptions = {
  kind?: string;
  title?: string;
  description?: string;
  icon?: string;
  rendererKey?: string;
  allowedWorkspaceIds: string[];
  defaultPayload?: ViewportMainUiEditorPayload;
};

export type MainUiRuntimeLike = {
  core: {
    registerEditor: (descriptor: ViewportMainUiCompatibleEditorDescriptor) => void;
  };
  vue: {
    registerEditorRenderer: (rendererKey: string, component: unknown) => void;
  };
};

export function createViewportMainUiEditorDescriptor(
  options: ViewportMainUiEditorDescriptorOptions,
): ViewportMainUiCompatibleEditorDescriptor {
  const kind = options.kind ?? VIEWPORT_MAIN_UI_EDITOR_KIND;
  const rendererKey = options.rendererKey ?? VIEWPORT_MAIN_UI_RENDERER_KEY;

  return {
    kind,
    title: options.title ?? 'Viewport 2D',
    description: options.description ?? 'Generic Vue viewport editor for main-ui tabs.',
    icon: options.icon ?? 'map',
    rendererKey,
    createDefaultPayload: options.defaultPayload
      ? () => ({ ...(options.defaultPayload as Record<string, unknown>) })
      : undefined,
    capability: {
      allowCreate: true,
      allowDuplicate: true,
      allowMultipleInstances: true,
      allowMultipleSurfacesPerInstance: false,
      allowClose: true,
      allowReorderInGroup: true,
      allowMoveAcrossGroups: true,
      allowSplitDrop: true,
      allowPopoutWindow: false,
      allowFloatingWindow: false,
      allowModalOverlay: false,
      allowMirrorDisplay: false,
      launcherVisibility: 'visible',
    },
    presentation: {
      defaultSurface: 'tab',
      canPromoteModalToTab: false,
    },
    availability: {
      allowedWorkspaceIds: options.allowedWorkspaceIds,
    },
  };
}

export function registerViewportMainUiEditor(
  runtime: MainUiRuntimeLike,
  options: ViewportMainUiEditorDescriptorOptions,
): ViewportMainUiCompatibleEditorDescriptor {
  const descriptor = createViewportMainUiEditorDescriptor(options);
  runtime.core.registerEditor(descriptor);
  runtime.vue.registerEditorRenderer(descriptor.rendererKey, ViewportMainUiEditor);
  return descriptor;
}
