/**
 * 螺旋叙事的全部进度区间与插值工具。文案节奏与 3D 运动共用这一张表。
 */

export const SPIRAL_PHASES = {
  hero: {
    exitStart: 0.04,
    exitEnd: 0.075,
    hiddenAt: 0.085,
  },
  chat: {
    enterStart: 0.06,
    enterEnd: 0.115,
    titleEnterStart: 0.075,
    titleEnterEnd: 0.125,
    titleExitStart: 0.365,
    titleExitEnd: 0.41,
    exitStart: 0.27,
    exitEnd: 0.325,
    dockProgress: 0.325,
  },
  duo: {
    enterStart: 0.4,
    enterEnd: 0.455,
    titleEnterStart: 0.41,
    titleEnterEnd: 0.46,
    titleExitStart: 0.685,
    titleExitEnd: 0.745,
    exitStart: 0.6,
    exitEnd: 0.655,
    dockProgress: 0.655,
  },
  timeline: {
    enterStart: 0.735,
    enterEnd: 0.8,
    titleEnterStart: 0.745,
    titleEnterEnd: 0.8,
    titleExitStart: 0.93,
    titleExitEnd: 0.99,
    exitStart: 0.95,
    exitEnd: 1,
    dockProgress: 1,
  },
} as const;

/** 两次阶段交接，各附加一整圈旋转。 */
export const SPIRAL_HANDOFFS = [
  { start: 0.325, end: 0.4 },
  { start: 0.655, end: 0.735 },
] as const;

export type PhaseSpec = (typeof SPIRAL_PHASES)[keyof typeof SPIRAL_PHASES] & {
  enterStart?: number;
  enterEnd?: number;
  exitStart?: number;
  exitEnd?: number;
};

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function smoothstep(from: number, to: number, value: number) {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
}

export function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

/** 角度插值，经 atan2 处理 ±π 环绕。 */
export function mixAngle(from: number, to: number, amount: number) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * amount;
}
