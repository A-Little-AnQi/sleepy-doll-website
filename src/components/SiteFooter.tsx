import { discordUrl, footerNote, qqUrl } from '../site';
import { WebsiteAnalytics } from '../releases';

export function SiteFooter() {
  return (
    <footer className="footer">
      <WebsiteAnalytics />
      <div className="footer__inner">
        <span className="footer__brand">{footerNote}</span>
        <nav className="footer__links" aria-label="页脚">
          <a href={discordUrl} target="_blank" rel="noreferrer">Discord 社区 ↗</a>
          <a href={qqUrl} target="_blank" rel="noreferrer">QQ 交流群 ↗</a>
        </nav>
      </div>
    </footer>
  );
}
