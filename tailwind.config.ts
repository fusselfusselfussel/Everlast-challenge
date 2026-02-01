import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-primary',
    'text-primary',
    'border-primary',
    'bg-black',
    'text-white',
    'hover:bg-primary/90',
    'hover:bg-primary/10',
    'border-2',
    'text-text/80',
    'text-text/70',
    'text-text/50',
    'bg-text/50',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFF44F',
        background: '#000000',
        text: '#FFFFFF',
        'yellow-accent': '#FFF44F',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
}
export default config
