/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        senior: {
          calm: '#e8f4f8',
          trust: '#4a90a4',
          safe: '#6b9e78',
          warm: '#f4a261',
        }
      },
      fontSize: {
        'senior-base': '1.125rem',
        'senior-lg': '1.5rem',
        'senior-xl': '2rem',
        'senior-2xl': '2.5rem',
      },
      spacing: {
        'tap-target': '44px', // Minimum touch target for seniors
      }
    },
  },
  plugins: [],
}

