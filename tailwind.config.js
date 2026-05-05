/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand Colors
        'primary': '#40916C',
        'primary-light': '#52B788',
        'primary-dark': '#2D6A4F',
        
        'secondary': '#FFB35C',
        'secondary-light': '#FFD29D',
        'secondary-dark': '#E76F51',
        
        'accent': '#D8F3DC',
        
        // Backgrounds & Surfaces
        'background': '#F9FBF9',
        'surface': '#FFFFFF',
        'surface-hover': '#F0F7F4',
        
        // Text Colors
        'text-primary': '#1B4332',
        'text-secondary': '#52796F',
        'text-on-primary': '#FFFFFF',
        'text-on-secondary': '#1B4332',
        
        // Status Colors
        'success': '#74C69D',
        'warning': '#FFB703',
        'error': '#E63946',
        'info': '#A8DADC',
      },
    },
  },
  plugins: [],
}