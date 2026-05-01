import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7A9E8A',
          dark: '#628071',
          light: '#EEF4F0',
        },
        bg: {
          DEFAULT: '#FAF9F6',
          card: '#FFFFFF',
        },
        text: {
          DEFAULT: '#1F1F1F',
          light: '#6B6B6B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        head: ['var(--font-outfit)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
