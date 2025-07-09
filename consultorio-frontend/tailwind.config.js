// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        layout: {
          light: '#f9fafb', // gray-50
          dark: '##1B1C1D',  
        },
      },
    },
  },
  plugins: [],
};
