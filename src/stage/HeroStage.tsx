import { useEffect, useRef } from 'react';
import { useMotionValue, useScroll } from 'motion/react';
import { ThreeHelixStage } from './ThreeHelixStage';
import { Headings } from './Headings';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { StaticStory } from './StaticStory';

/**
 * 主叙事舞台：滚动容器 + position:sticky 整屏舞台。
 * 进度由 motion 的 useScroll 归一化，ThreeHelixStage 阻尼后回写 damped，
 * 标题层与 3D 逐帧同步。手机(≤760px)容器 15000px，桌面约 20 屏滚动跨度。
 */
export function HeroStage() {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const damped = useMotionValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current!;
    // 部分嵌入式 WebView 会把数值超过 100 的视口单位压缩，高度由 JS 按像素显式设置。
    // 桌面跨度约 9 屏（滚轮全程约 80 格），手机 10000px。
    const applyHeight = () => {
      const mobile = window.innerWidth <= 760;
      container.style.height = mobile ? '10000px' : `${Math.round(window.innerHeight * 10)}px`;
    };
    applyHeight();
    window.addEventListener('resize', applyHeight);
    return () => window.removeEventListener('resize', applyHeight);
  }, [reducedMotion]);

  if (reducedMotion) {
    return <StaticStory />;
  }

  return (
    <div ref={containerRef} id="story" className="stage-scroll">
      <div className="stage-sticky">
        <ThreeHelixStage progress={scrollYProgress} damped={damped} reducedMotion={false} />
        <Headings progress={damped} />
      </div>
    </div>
  );
}
