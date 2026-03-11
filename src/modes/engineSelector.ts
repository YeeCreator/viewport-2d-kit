import type { ViewportEngineDescriptor, ViewportModeKind } from './contracts';

/**
 * 根据模式解析引擎信息。
 *
 * @param mode 模式名。
 * @returns 引擎描述对象。
 */
export function resolveViewportEngine(mode: ViewportModeKind): ViewportEngineDescriptor {
  if (mode === 'lite') {
    return {
      mode,
      engine: 'react-infinite-viewer',
      summary: '轻量平移/缩放场景使用 react-infinite-viewer。',
    };
  }

  return {
    mode,
    engine: 'pixi-viewport',
    summary: 'game/map 场景使用 pixi-viewport。',
  };
}

/**
 * 获取所有模式与引擎映射。
 *
 * @returns 引擎映射列表。
 */
export function listViewportEngineDescriptors(): ViewportEngineDescriptor[] {
  return [resolveViewportEngine('lite'), resolveViewportEngine('game'), resolveViewportEngine('map')];
}
