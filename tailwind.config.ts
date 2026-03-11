import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e3a5f', light: '#2a5280', dark: '#142a45', 50: '#eef4fb', 100: '#d0e2f5' },
        accent: { DEFAULT: '#00c853', light: '#4cdc7e', dark: '#009624' },
        surface: { DEFAULT: '#f8fafc', dark: '#0f172a', card: '#ffffff', muted: '#f1f5f9' },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
