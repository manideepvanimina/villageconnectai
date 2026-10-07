/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff8f1',
          100: '#feeedc',
          200: '#fddbb9',
          300: '#fbc18b',
          400: '#f89b53',
          500: '#f57c20',
          600: '#e66012',
          700: '#bf450e',
          800: '#983713',
          900: '#7c2f13',
        },
        earth: {
          50: '#fbf7f4',
          100: '#f5ece5',
          200: '#ebd9cb',
          300: '#dcbeaa',
          400: '#cb9c83',
          500: '#bd8064',
          600: '#ad6c51',
          700: '#905642',
          800: '#764739',
          900: '#603c31',
        },
        krishi: {
          50: '#f1f8f3',
          100: '#deefe3',
          200: '#bedfc9',
          300: '#92c7a6',
          400: '#62a97e',
          500: '#3e8d5e',
          600: '#2d714a',
          700: '#255a3c',
          800: '#1f4832',
          900: '#1a3c2a',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'rural': '0 4px 20px -2px rgba(245, 124, 32, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.06)',
        'rural-lg': '0 10px 25px -5px rgba(245, 124, 32, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
