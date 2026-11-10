// Vendored from packages/ui/src/brand/ (Sleepy-Doll repo) —— 与产品组件逐字同源。
// 品牌资产或行为升级时，从主仓库同步本文件，不在官网单独改。
import avatar from "./avatar.png";

type IconProps = { className?: string };

/** 产品图标：桑多涅 Q 版头像。全尺寸源图在 assets/brand/avatar.png，此处为 256px 副本。 */
export function BrandIcon({ className }: IconProps) {
  return (
    <img
      src={avatar}
      alt=""
      draggable={false}
      className={className ? `app-brand-icon ${className}` : "app-brand-icon"}
    />
  );
}
