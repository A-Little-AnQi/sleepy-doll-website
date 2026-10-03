import { discordUrl, footerNote, qqUrl } from '../site';
import { AnalyticsPreference } from '../releases';

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__brand">{footerNote}</span>
        <nav className="footer__links" aria-label="页脚">
          <a href="#/docs">帮助文档</a>
          <a href="#/docs/developer">开发者的话</a>
          <a href={discordUrl} target="_blank" rel="noreferrer">Discord 社区 ↗</a>
          <a href={qqUrl} target="_blank" rel="noreferrer">QQ 交流群 ↗</a>
          <AnalyticsPreference />
        </nav>
      </div>
    </footer>
  );
}
