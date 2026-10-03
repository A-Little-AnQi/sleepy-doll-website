/** 官网使用说明、常见问题、更新日志与开发计划。 */

import guide from './docs/guide.md?raw';
import faq from './docs/faq.md?raw';
import changelog from './docs/changelog.md?raw';
import developer from './docs/developer.md?raw';

export interface DocEntry {
  key: string;
  title: string;
  source: string;
  description: string;
}

export const docEntries: DocEntry[] = [
  { key: 'guide', title: '使用说明', description: '添加模型、连接 BetterGI，再试一次查询。', source: guide },
  { key: 'faq', title: '常见问题', description: '模型、连接、任务和更新的常见问题。', source: faq },
  { key: 'changelog', title: '更新日志', description: '已发布的内容和下一版的安排。', source: changelog },
  { key: 'developer', title: '开发者的话', description: '为什么先发测试版，以及接下来准备做什么。', source: developer },
];
