import { useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { SPIRAL_HANDOFFS, SPIRAL_PHASES, clamp, mix, mixAngle, smoothstep } from './spiralMotion';
import { CARD_COUNT, CHAT_CARD, TOOLS_CARD, CONNECTION_CARD, TIMELINE_CARD, createCard } from './cards';

/**
 * 24 张 CSS3D 卡片螺旋。滚动进度经指数阻尼（14.5）后驱动：
 * 背景卡随 theta 自由旋转、前景卡逐渐转到可读朝向；
 * 三个阶段把特殊卡从冻结的螺旋基座抽到目标位（带倾斜角），
 * 其余卡降透明度与饱和度；螺旋轴向端点渐隐；zIndex 逐帧按深度排列。
 * rAF 仅在有进度差时运行，静止即停。
 */

type CardKind = 'plain' | 'chat' | 'tools' | 'connection' | 'timeline';

type CardRecord = {
  body: HTMLDivElement;
  element: HTMLDivElement;
  kind: CardKind;
  object: CSS3DObject;
  index: number;
};

const CARD_SCALE = 0.003525;
const CARD_ANGLE = Math.PI / 6;
const CARD_RISE = 0.72;
const HELIX_RADIUS = 3.25;
const HELIX_DEPTH = 4.8;
const HELIX_TILT = 0.12;
const HELIX_OFFSET_X = 5.8;

type KindAt = (index: number) => CardKind;

const kindOf: KindAt = (index) =>
  index === CHAT_CARD
    ? 'chat'
    : index === TOOLS_CARD
      ? 'tools'
      : index === CONNECTION_CARD
        ? 'connection'
        : index === TIMELINE_CARD
          ? 'timeline'
          : 'plain';

function handoffTurn(progress: number) {
  return SPIRAL_HANDOFFS.reduce(
    (turn, phase) => turn + smoothstep(phase.start, phase.end, progress) * Math.PI * 2,
    0,
  );
}

function wrapCentered(value: number, range: number) {
  return (((value + range / 2) % range) + range) % range - range / 2;
}

type BaseTransform = {
  theta: number;
  axis: number;
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
};

/** 螺旋基座位姿：径向 x 与轴向 y 一起倾斜 .12rad，前景卡随深度锁向可读朝向。 */
function baseTransform(index: number, progress: number): BaseTransform {
  const orbitDelta = progress * 5 + handoffTurn(progress);
  const orbit = -1.55 + orbitDelta;
  const theta = index * CARD_ANGLE + orbit;
  const loopLength = CARD_COUNT * CARD_RISE;
  const axial = wrapCentered(
    (index - (CARD_COUNT - 1) / 2) * CARD_RISE + (orbitDelta / CARD_ANGLE) * CARD_RISE,
    loopLength,
  );
  const radialX = -Math.sin(theta) * HELIX_RADIUS;
  const tiltCos = Math.cos(HELIX_TILT);
  const tiltSin = Math.sin(HELIX_TILT);
  const spinDirection = index % 2 === 0 ? 1 : -1;
  const localSpin =
    Math.sin(progress * Math.PI * 2 * (1.18 + (index % 3) * 0.08) + index * 0.47) *
    (0.072 + (index % 3) * 0.01) *
    spinDirection;
  const depth = (Math.cos(theta) + 1) / 2;
  const freeRotation = theta + 0.24 + localSpin;
  const readableAngle = -Math.sin(theta) * 0.24;
  const frontLock = smoothstep(0.64, 0.94, depth);
  return {
    theta,
    axis: axial,
    x: radialX * tiltCos - axial * tiltSin,
    y: radialX * tiltSin + axial * tiltCos,
    z: Math.cos(theta) * HELIX_DEPTH,
    rx: -0.13 + Math.sin(theta * 1.3) * 0.08,
    ry: mixAngle(freeRotation, readableAngle, frontLock),
    rz: 0.105 + Math.sin(theta * 0.7) * 0.035,
  };
}

function extractionAmount(kind: CardKind, progress: number) {
  if (kind === 'chat') {
    const enter = smoothstep(SPIRAL_PHASES.chat.enterStart, SPIRAL_PHASES.chat.enterEnd, progress);
    const leave = smoothstep(SPIRAL_PHASES.chat.exitStart, SPIRAL_PHASES.chat.exitEnd, progress);
    return enter * (1 - leave);
  }
  if (kind === 'tools' || kind === 'connection') {
    const enter = smoothstep(SPIRAL_PHASES.duo.enterStart, SPIRAL_PHASES.duo.enterEnd, progress);
    const leave = smoothstep(SPIRAL_PHASES.duo.exitStart, SPIRAL_PHASES.duo.exitEnd, progress);
    return enter * (1 - leave);
  }
  if (kind === 'timeline') {
    const enter = smoothstep(
      SPIRAL_PHASES.timeline.enterStart,
      SPIRAL_PHASES.timeline.enterEnd,
      progress,
    );
    const leave = smoothstep(
      SPIRAL_PHASES.timeline.exitStart,
      SPIRAL_PHASES.timeline.exitEnd,
      progress,
    );
    return enter * (1 - leave);
  }
  return 0;
}

type ExtractTarget = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
};

type StageProps = {
  progress: MotionValue<number>;
  /** 阻尼后的进度回写，标题层与它保持逐帧同步。 */
  damped: MotionValue<number>;
  reducedMotion: boolean;
};

export function ThreeHelixStage({ progress, damped, reducedMotion }: StageProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new CSS3DRenderer();
    renderer.domElement.className = 'three-helix-renderer';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    host.appendChild(renderer.domElement);

    const world = new THREE.Group();
    scene.add(world);

    const cards: CardRecord[] = Array.from({ length: CARD_COUNT }, (_, index) => {
      const kind = kindOf(index);
      const element = createCard(index, kind);
      const body = element.querySelector<HTMLDivElement>('.three-card-body');
      if (!body) throw new Error('card body is missing');
      const object = new CSS3DObject(element);
      object.scale.setScalar(CARD_SCALE);
      world.add(object);
      return { body, element, kind, object, index };
    });

    let compact = false;
    let targetProgress = progress.get();
    let renderedProgress = targetProgress;
    let animationFrame = 0;
    let previousFrameTime = 0;
    let pointerFrame = 0;
    let pointerActive = false;
    let pointerX = -10000;
    let pointerY = -10000;

    const updatePointerTilt = () => {
      pointerFrame = 0;
      const canTilt = pointerActive && !compact && !reducedMotion;

      cards.forEach((card) => {
        const rect = card.element.getBoundingClientRect();
        const nearestX = clamp(pointerX, rect.left, rect.right);
        const nearestY = clamp(pointerY, rect.top, rect.bottom);
        const distance = Math.hypot(pointerX - nearestX, pointerY - nearestY);
        const proximity =
          canTilt && rect.width > 40 && rect.height > 24 ? 1 - clamp(distance / 56) : 0;
        const normalizedX = clamp(
          (pointerX - (rect.left + rect.width / 2)) / Math.max(rect.width / 2, 1),
          -1,
          1,
        );
        const normalizedY = clamp(
          (pointerY - (rect.top + rect.height / 2)) / Math.max(rect.height / 2, 1),
          -1,
          1,
        );

        card.body.style.setProperty('--pointer-tilt-x', `${(-normalizedY * 3.1 * proximity).toFixed(3)}deg`);
        card.body.style.setProperty('--pointer-tilt-y', `${(normalizedX * 4 * proximity).toFixed(3)}deg`);
        card.body.style.setProperty('--pointer-tilt-z', `${(-normalizedX * 0.35 * proximity).toFixed(3)}deg`);
        card.body.style.setProperty('--pointer-lift', `${(proximity * 3).toFixed(2)}px`);
        card.element.classList.toggle('is-pointer-near', proximity > 0.02);
      });
    };

    const schedulePointerTilt = () => {
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointerTilt);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerActive = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
      schedulePointerTilt();
    };

    const clearPointerTilt = () => {
      pointerActive = false;
      pointerX = -10000;
      pointerY = -10000;
      schedulePointerTilt();
    };

    const renderAt = (rawProgress: number) => {
      const position = reducedMotion ? 0.08 : clamp(rawProgress);

      world.position.x = compact ? 0 : HELIX_OFFSET_X;
      world.rotation.set(0, 0, 0);

      const chatFocus = extractionAmount('chat', position);
      const duoFocus = extractionAmount('tools', position);
      const rosterFocus = extractionAmount('timeline', position);
      const sceneFocus = Math.max(chatFocus, duoFocus, rosterFocus);

      cards.forEach((card) => {
        let base = baseTransform(card.index, position);
        const isTools = card.kind === 'tools';

        const phase =
          card.kind === 'chat'
            ? SPIRAL_PHASES.chat
            : card.kind === 'timeline'
              ? SPIRAL_PHASES.timeline
              : card.kind === 'tools' || card.kind === 'connection'
                ? SPIRAL_PHASES.duo
                : null;
        let pull = 0;
        // 抽出期间基座冻结在阶段边界的螺旋位姿，卡从静止起点滑向目标。
        if (phase) {
          if (position >= phase.enterStart && position < phase.enterEnd) {
            base = baseTransform(card.index, phase.enterStart);
            pull = clamp((position - phase.enterStart) / (phase.enterEnd - phase.enterStart));
          } else if (position >= phase.enterEnd && position < phase.exitStart) {
            pull = 1;
          } else if (position >= phase.exitStart && position < phase.exitEnd) {
            base = baseTransform(card.index, phase.exitEnd);
            pull = 1 - clamp((position - phase.exitStart) / (phase.exitEnd - phase.exitStart));
          }
        }

        const chatTarget: ExtractTarget = compact
          ? { x: 0.1, y: -0.3, z: 20.4, rx: -0.1, ry: -0.28, rz: -0.025, scale: 0.0062 }
          : { x: -4.85, y: -0.12, z: 10.15, rx: -0.08, ry: -0.24, rz: -0.018, scale: 0.0045 };
        const duoTarget: ExtractTarget = {
          x: compact ? (isTools ? -0.35 : 0.35) : isTools ? -7.5 : -4.3,
          y: compact ? (isTools ? 0.55 : -2.15) : -0.78,
          z: compact ? 20.2 : 10.35,
          rx: isTools ? -0.13 : -0.07,
          ry: isTools ? 0.28 : -0.28,
          rz: isTools ? -0.035 : 0.035,
          scale: compact ? 0.0048 : 0.00305,
        };
        const timelineTarget: ExtractTarget = compact
          ? { x: 0, y: -0.65, z: 20.25, rx: -0.07, ry: -0.2, rz: -0.018, scale: 0.0058 }
          : { x: -5.1, y: 0.2, z: 10.2, rx: -0.07, ry: -0.2, rz: -0.018, scale: 0.0039 };
        const target =
          card.kind === 'chat'
            ? chatTarget
            : card.kind === 'timeline'
              ? timelineTarget
              : duoTarget;

        card.object.position.set(
          mix(base.x, target.x, pull),
          mix(base.y, target.y, pull),
          mix(base.z, target.z, pull),
        );
        card.object.rotation.set(
          mix(base.rx, target.rx, pull),
          mixAngle(base.ry, target.ry, pull),
          mix(base.rz, target.rz, pull),
        );
        card.object.scale.setScalar(mix(CARD_SCALE, target.scale, pull));

        const depth = (Math.cos(base.theta) + 1) / 2;
        const focusStrength = smoothstep(0, 0.22, pull);
        // 螺旋轴向端点渐隐。
        const edgeFade =
          1 -
          smoothstep(
            CARD_COUNT * CARD_RISE * 0.36,
            CARD_COUNT * CARD_RISE * 0.49,
            Math.abs(base.axis),
          );
        const baseOpacity = (0.26 + depth * 0.72) * edgeFade;
        const isActiveCard = pull > 0.001;
        const queueSuppression = isActiveCard ? 0 : smoothstep(0.08, 0.72, sceneFocus);
        const heroReveal = mix(0.52, 1, smoothstep(0.015, 0.095, position));
        const queueOpacity = baseOpacity * heroReveal * mix(1, 0.72, queueSuppression);
        const opacity = mix(queueOpacity, 1, focusStrength);
        card.element.style.opacity = String(opacity);
        // 饱和度接近 1 时不设 filter：滤镜会把卡变成合成层纹理，文本发糊。
        const saturation = mix(0.55 + depth * 0.45, 1, focusStrength);
        card.element.style.filter = saturation < 0.995 ? `saturate(${saturation.toFixed(3)})` : '';
        card.element.style.zIndex = String(Math.round((card.object.position.z + 20) * 100));
        card.element.classList.toggle('is-extracting', isActiveCard);
      });

      renderer.render(scene, camera);
      damped.set(position);
      if (pointerActive) schedulePointerTilt();
    };

    const settleFrame = (timestamp: number) => {
      const elapsed = previousFrameTime
        ? Math.min((timestamp - previousFrameTime) / 1000, 0.05)
        : 1 / 60;
      previousFrameTime = timestamp;
      const delta = targetProgress - renderedProgress;
      renderedProgress += delta * (1 - Math.exp(-elapsed * 14.5));
      if (Math.abs(delta) < 0.00005) renderedProgress = targetProgress;
      renderAt(renderedProgress);
      if (renderedProgress !== targetProgress) {
        animationFrame = requestAnimationFrame(settleFrame);
      } else {
        animationFrame = 0;
        previousFrameTime = 0;
      }
    };

    const scheduleRender = (nextProgress: number) => {
      targetProgress = nextProgress;
      if (!animationFrame) {
        previousFrameTime = 0;
        animationFrame = requestAnimationFrame(settleFrame);
      }
    };

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      compact = width < 760;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.fov = compact ? 46 : 38;
      camera.position.z = compact ? 27 : 18;
      camera.updateProjectionMatrix();
      targetProgress = progress.get();
      renderedProgress = targetProgress;
      renderAt(renderedProgress);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const unsubscribe = progress.on('change', scheduleRender);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', clearPointerTilt);
    document.documentElement.addEventListener('mouseleave', clearPointerTilt);
    resize();

    return () => {
      unsubscribe();
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(pointerFrame);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', clearPointerTilt);
      document.documentElement.removeEventListener('mouseleave', clearPointerTilt);
      cards.forEach(({ object, element }) => {
        world.remove(object);
        element.remove();
      });
      renderer.domElement.remove();
    };
  }, [progress, damped, reducedMotion]);

  return <div className="three-helix-stage" ref={hostRef} aria-hidden="true" />;
}
