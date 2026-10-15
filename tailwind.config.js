/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        'primary-glow': 'var(--primary-glow)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        paper: 'var(--paper)',
        'paper-ink': 'var(--paper-ink)',
      },
      fontFamily: {
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'Figtree', 'sans-serif'],
        doc: ['Carlito', 'Calibri', 'Source Sans 3', 'sans-serif'],
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 12px)',
        '4xl': 'calc(var(--radius) + 16px)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        paper: 'var(--shadow-paper)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        hero: 'var(--gradient-hero)',
      },
      keyframes: {
        'step-in': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'none' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'step-in': 'step-in 0.35s cubic-bezier(.2,.8,.2,1)',
        rise: 'rise 0.5s cubic-bezier(.2,.8,.2,1) both',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
