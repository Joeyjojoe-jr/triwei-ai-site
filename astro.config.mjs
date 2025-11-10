import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
export default defineConfig({
  site: 'https://triwei.ai',
  output: 'static',
  integrations: [tailwind({ applyBaseStyles: true })],
});