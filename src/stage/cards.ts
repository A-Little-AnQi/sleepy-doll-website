/**
 * 螺旋卡片的 DOM 内容工厂。设计稿 960×540，产品图来自 assets/previews，
 * 特殊卡显式映射到与卡同尺寸（960×540）的软件图标画风 SVG。
 *
 * 索引 5/14/15/0 是特殊卡：对话卡、工具卡、连接卡、时间线卡；
 * 其余是普通卡（编号 + 灰线 + 圆形占位），每四张中的一张淡黄。
 */

import chatArt from '../assets/previews/chat.svg';
import toolsArt from '../assets/previews/tools.svg';
import connectionArt from '../assets/previews/connection.svg';
import timelineArt from '../assets/previews/timeline.svg';

export const CARD_COUNT = 24;
export const CHAT_CARD = 5;
export const TOOLS_CARD = 14;
export const CONNECTION_CARD = 15;
export const TIMELINE_CARD = 0;

export type CardKind = 'plain' | 'chat' | 'tools' | 'connection' | 'timeline';

/** 特殊卡产品图：卡型与 SVG 一一对应，alt 描述该卡的功能叙事。 */
const CARD_ART: Record<Exclude<CardKind, 'plain'>, { src: string; alt: string }> = {
  chat: { src: chatArt, alt: '对话气泡与声音波形' },
  tools: { src: toolsArt, alt: '自由组合的几何工具模块' },
  connection: { src: connectionArt, alt: '连接节点与信号轨道' },
  timeline: { src: timelineArt, alt: '时钟与循环运行的任务文件' },
};

function previewFront(kind: Exclude<CardKind, 'plain'>): string {
  const art = CARD_ART[kind];
  return `<img class="product-preview" src="${art.src}" alt="${art.alt}" loading="eager" />`;
}

function plainFront(idx: number): string {
  const num = String(idx + 1).padStart(2, '0');
  return `
    <div class="plain">
      <div class="plain__num">${num}</div>
      <div class="plain__lines">
        <i style="width:184px"></i>
        <i style="width:132px"></i>
        <i style="width:92px"></i>
      </div>
      <div class="plain__disc">
        <i></i>
      </div>
    </div>`;
}

function frontHTMLImpl(kind: CardKind, idx: number): string {
  return kind === 'plain' ? plainFront(idx) : previewFront(kind);
}

/** 卡片正面内容 HTML，静态章节（减少动态效果）复用。 */
export function frontHTML(kind: CardKind, idx: number): string {
  return frontHTMLImpl(kind, idx);
}

/**
 * 创建一张完整卡片：body 承载指针倾斜变量，face/back 双面同内容，
 * 右侧/底侧厚度边。正反面内容一致，翻转后自然可读、不镜像。
 */
export function createCard(index: number, kind: CardKind): HTMLDivElement {
  const element = document.createElement('div');
  element.className = `three-card three-card--${kind}${kind === 'plain' && index % 4 === 1 ? ' is-yellow' : ''}`;
  element.setAttribute('aria-hidden', 'true');
  const front = kind === 'plain'
    ? plainFront(index)
    : `<div class="three-card-placeholder">${plainFront(index)}</div><div class="three-card-art">${previewFront(kind)}</div>`;
  // 背面不放预览图：face/back 同内容在 CSS3DRenderer 嵌套 transform 下 backface-visibility
  // 不生效，预览图会双份同屏渲染（2026-11-09 用户确认的重复图标根因）。
  const back = plainFront(index);
  element.innerHTML = `
    <div class="three-card-body">
      <div class="three-card-face">${front}</div>
      <div class="three-card-back">${back}</div>
      <i class="three-card-edge three-card-edge--right"></i>
      <i class="three-card-edge three-card-edge--bottom"></i>
    </div>`;
  return element;
}
