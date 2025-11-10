export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: { primary:'#2f5dff', accent:'#ff5da2', ink:'#0b1020', paper:'#f6f8ff' },
      fontFamily: { sans: ['ui-sans-serif','system-ui'] }
    }
  },
  plugins: []
};