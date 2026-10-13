/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#17324d',
        secondary: '#2a7f7f',
        neutral: '#f7f5f0',
        'accent-beauty': '#f3d7cc',
        'accent-gold': '#d4a85a',
        background: '#f7f5f0',
        surface: '#ffffff',
        text: '#17324d',
        'text-muted': '#586777',
        border: '#dce2e5',
        success: '#237a52',
        warning: '#946200',
        error: '#b42318',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
};
