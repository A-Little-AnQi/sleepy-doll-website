/**
 * 螺旋卡片的 DOM 内容工厂。设计稿 960×540，产品图来自 assets/previews，支持直接替换图片。
 *
 * 索引 5/14/15/0 是特殊卡：对话卡、工具卡、连接卡、时间线卡；
 * 其余是普通卡（编号 + 灰线 + 圆形占位），每四张中的一张淡黄。
 */

export const CARD_COUNT = 24;
export const CHAT_CARD = 5;
export const TOOLS_CARD = 14;
export const CONNECTION_CARD = 15;
export const TIMELINE_CARD = 0;

export type CardKind = 'plain' | 'chat' | 'tools' | 'connection' | 'timeline';

const previewFiles = import.meta.glob('../assets/previews/*.{webp,png,jpg,jpeg,svg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
function previewFront(kind: Exclude<CardKind, 'plain'>): string {
  const file = ['webp', 'png', 'jpg', 'jpeg', 'svg'].map(ext => previewFiles[`../assets/previews/${kind}.${ext}`]).find(Boolean);
  return `<img class="product-preview" src="${file}" alt="" loading="eager" />`;
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
  const content = kind === 'plain'
    ? plainFront(index)
    : `<div class="three-card-placeholder">${plainFront(index)}</div><div class="three-card-art">${previewFront(kind)}</div>`;
  element.innerHTML = `
    <div class="three-card-body">
      <div class="three-card-face">${content}</div>
      <div class="three-card-back">${content}</div>
      <i class="three-card-edge three-card-edge--right"></i>
      <i class="three-card-edge three-card-edge--bottom"></i>
    </div>`;
  return element;
}
