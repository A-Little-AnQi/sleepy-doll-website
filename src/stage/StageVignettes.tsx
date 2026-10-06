import { useState } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react';
import { SPIRAL_PHASES } from './spiralMotion';
import querySource from '../assets/request-animation.svg?raw';
import parcelSource from '../assets/task-parcel.svg?raw';

type VignetteKind = 'query' | 'parcel';
const sources = { query: querySource, parcel: parcelSource };

export function FloatingVignette({ kind, className = '' }: { kind: VignetteKind; className?: string }) {
  return <div className={`floating-vignette ${className}`} aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: sources[kind] }} />;
}

export function StageVignettes({ progress }: { progress: MotionValue<number> }) {
  const { chat, timeline } = SPIRAL_PHASES;
  const [queryActive, setQueryActive] = useState(() => progress.get() >= chat.titleEnterStart && progress.get() < chat.titleExitEnd);
  const [parcelActive, setParcelActive] = useState(() => progress.get() >= timeline.titleEnterStart && progress.get() < timeline.titleExitEnd);
  useMotionValueEvent(progress, 'change', value => {
    setQueryActive(value >= chat.titleEnterStart && value < chat.titleExitEnd);
    setParcelActive(value >= timeline.titleEnterStart && value < timeline.titleExitEnd);
  });
  const queryOpacity = useTransform(progress, [chat.titleEnterStart, chat.titleEnterEnd, chat.titleExitStart, chat.titleExitEnd], [0, 1, 1, 0]);
  const parcelOpacity = useTransform(progress, [timeline.titleEnterStart, timeline.titleEnterEnd, timeline.titleExitStart, timeline.titleExitEnd], [0, 1, 1, 0]);
  const queryY = useTransform(queryOpacity, [0, 1], [12, 0]);
  const parcelY = useTransform(parcelOpacity, [0, 1], [18, 0]);
  return <>
    <motion.div className="stage-vignette stage-vignette--query" style={{ opacity: queryOpacity, y: queryY }}>
      {queryActive && <FloatingVignette kind="query" />}
    </motion.div>
    <motion.div className="stage-vignette stage-vignette--parcel" style={{ opacity: parcelOpacity, y: parcelY }}>
      {parcelActive && <FloatingVignette kind="parcel" />}
    </motion.div>
  </>;
}
