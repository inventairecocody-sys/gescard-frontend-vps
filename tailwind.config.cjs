/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  theme: {
    extend: {
      colors: {
        orangeMain: "#F77F00",
        orangeSecondary: "#FF9E40",
        greenMain: "#2E8B57",
        blueMain: "#0077B6",
        blueLight: "#00A8E8",
      },
      
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 20px -3px rgba(0, 0, 0, 0.1), 0 12px 25px -2px rgba(0, 0, 0, 0.06)',
        'hard': '0 10px 40px -5px rgba(0, 0, 0, 0.15), 0 20px 50px -2px rgba(0, 0, 0, 0.08)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      backgroundImage: {
        'gradient-orange': 'linear-gradient(to right, #F77F00, #FF9E40)',
        'gradient-blue': 'linear-gradient(to right, #0077B6, #2E8B57)',
        'gradient-green': 'linear-gradient(to right, #2E8B57, #0077B6)',
      },
    },
  },
  
  plugins: [],
}