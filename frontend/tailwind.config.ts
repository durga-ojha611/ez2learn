import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#07345B',
          50: '#F0F5FA',
          100: '#DDE9F4',
          200: '#BDD5EB',
          300: '#8FBADF',
          400: '#5A9AD0',
          500: '#347DBE',
          600: '#2364A3',
          700: '#1B4F83',
          800: '#0F3C66',
          900: '#07345B', // Primary Navy 30%
          950: '#04203A',
        },
        brandYellow: {
          DEFAULT: '#FAB10B',
          50: '#FEF9E7',
          100: '#FDF1C4',
          200: '#FCE48B',
          300: '#FBD252',
          400: '#FAC126',
          500: '#FAB10B', // Brand Yellow 10%
          600: '#E09B05',
          700: '#B87A04',
          800: '#935F0A',
        },
        pureWhite: '#FFFFFF', // 60%
        pageBg: '#FFFFFF', // 60% Pure White
        textPrimary: '#172B3A', // Main Text
        textSecondary: '#748190', // Secondary Text
        borderSubtle: '#E9EDF2', // Supporting Border
        borderHover: '#D4DBE4',
      },
      fontFamily: {
        sans: ['"Poppins"', 'sans-serif'],
        heading: ['"Poppins"', 'sans-serif'],
        body: ['"Poppins"', 'sans-serif'],
        poppins: ['"Poppins"', 'sans-serif'],
        roboto: ['"Poppins"', 'sans-serif'],
        citadel: ['"Poppins"', 'sans-serif'],
        cinzel: ['"Poppins"', 'sans-serif'],
        bricolage: ['"Poppins"', 'sans-serif'],
        lato: ['"Poppins"', 'sans-serif'],
        jost: ['"Poppins"', 'sans-serif'],
        montserrat: ['"Poppins"', 'sans-serif'],
        worksans: ['"Poppins"', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['48px', { lineHeight: '54px', fontWeight: '800' }],
        'stat-number': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'section-heading': ['22px', { lineHeight: '30px', fontWeight: '700' }],
        'card-heading': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'table-header': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'table-content': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'body-text': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'supporting': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'button': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'nav-item': ['14px', { lineHeight: '20px', fontWeight: '500' }],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(7, 52, 91, 0.03)',
        card: '0 2px 8px -2px rgba(7, 52, 91, 0.04), 0 1px 2px 0 rgba(7, 52, 91, 0.02)',
        elevated: '0 12px 28px -6px rgba(7, 52, 91, 0.08), 0 4px 10px -4px rgba(7, 52, 91, 0.03)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
};

export default config;
