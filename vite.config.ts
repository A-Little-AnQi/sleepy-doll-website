import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 官网构建配置。
 *
 * base 使用相对路径，产物可以放在任意子路径下静态托管（GitHub Pages、对象存储等），
 * 不依赖服务器端路由回退之外的基础路径约定。
 */
export default defineConfig({
  base: './',
  plugins: [react()],
});
