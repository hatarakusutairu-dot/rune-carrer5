/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        seedling: {
          challenge: '#FF7043',
          analysis: '#42A5F5',
          support: '#66BB6A',
          leader: '#AB47BC',
          continuity: '#FFA726',
          balance: '#26A69A',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Hiragino Sans',
          'Hiragino Kaku Gothic ProN',
          'Meiryo',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
