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
          DEFAULT: '#4F674E',
          dark: '#3D4F3C',
          light: '#F0F4F0',
        },
        accent: {
          DEFAULT: '#D2AF78',
          dark: '#B99760',
        },
        bg: {
          DEFAULT: '#FDF9F4',
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
