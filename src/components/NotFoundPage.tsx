import { SiteNav } from './SiteNav';
import { SiteFooter } from './SiteFooter';

/**
 * 通用未找到页：/docs 之外的未知地址在应用内显示这里（/docs 下的
 * 未知地址由 DocsPage 显示文档未找到），不再退回首页内容。
 * 样式直接引用 global.css 的现有变量，不新增全局规则。
 */

const sectionStyle = {
  minHeight: '58vh',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  padding: '72px 24px 96px',
  textAlign: 'center' as const,
};

const codeStyle = {
  margin: 0,
  fontSize: '15px',
  fontWeight: 650,
  letterSpacing: '0.14em',
  color: 'var(--ink-3)',
};

const titleStyle = {
  margin: 0,
  fontSize: 'clamp(30px, 4vw, 40px)',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: 'var(--ink)',
};

const textStyle = {
  margin: '0 0 18px',
  maxWidth: '460px',
  fontSize: '16px',
  lineHeight: 1.75,
  color: 'var(--ink-2)',
};

const actionsStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  justifyContent: 'center',
  gap: '12px',
};

const primaryStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '11px 20px',
  borderRadius: '10px',
  background: 'var(--accent)',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 620,
  textDecoration: 'none',
};

const ghostStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '11px 20px',
  borderRadius: '10px',
  border: '1px solid var(--hairline, rgba(21, 21, 21, 0.14))',
  color: 'var(--ink)',
  fontSize: '15px',
  fontWeight: 620,
  textDecoration: 'none',
};

export function NotFoundPage() {
  return (
    <div id="top">
      <SiteNav />
      <main style={sectionStyle}>
        <p style={codeStyle}>404</p>
        <h1 style={titleStyle}>页面未找到</h1>
        <p style={textStyle}>
          这个地址没有对应的页面，可能已移动或从未存在。可以从首页继续，
          或到帮助文档里查找需要的内容。
        </p>
        <div style={actionsStyle}>
          <a style={primaryStyle} href="/">返回首页</a>
          <a style={ghostStyle} href="/docs">查看帮助文档</a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
