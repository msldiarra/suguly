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
          DEFAULT: '#F47B20',
          dark: '#d4620d',
          light: '#fff3e8',
        },
        bg: {
          DEFAULT: '#F5F3EF',
          card: '#F0EDE8',
        },
        text: {
          DEFAULT: '#1C1917',
          light: '#7a6f66',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'sans-serif'],
        head: ['var(--font-sora)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
