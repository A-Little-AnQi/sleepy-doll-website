// Vendored from packages/ui/src/brand/ (Sleepy-Doll repo) —— 与产品组件逐字同源。
// 品牌资产或行为升级时，从主仓库同步本文件，不在官网单独改。
import wordmark from "./wordmark.png";
import "./Wordmark.css";

type IconProps = { className?: string };

/** 产品字标：插画风 Pudding 全名。全尺寸源图在 video/output/pudding-brand/（本地），
 * 此处为 256px 高使用副本。 */
export function Wordmark({ className }: IconProps) {
  return (
    <img
      src={wordmark}
      alt="Pudding"
      draggable={false}
      className={className ?? "app-wordmark"}
    />
  );
}
