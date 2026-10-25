/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch Cyber-Clean Surface Tokens
        surface: '#0f131d',
        'surface-dim': '#0f131d',
        'surface-bright': '#353944',
        'surface-container-lowest': '#0a0e17',
        'surface-container-low': '#171c25',
        'surface-container': '#1b2029',
        'surface-container-high': '#262a34',
        'surface-container-highest': '#31353f',
        'on-surface': '#dfe2f0',
        'on-surface-variant': '#c7c4d7',
        outline: '#908fa0',
        'outline-variant': '#464554',

        // Stitch Brand Accents
        primary: '#c0c1ff',
        'primary-container': '#8083ff',
        'on-primary': '#1000a9',
        'on-primary-container': '#0d0096',
        'inverse-primary': '#494bd6',
        'primary-fixed': '#e1e0ff',
        'primary-fixed-dim': '#c0c1ff',

        secondary: '#4cd7f6',
        'secondary-container': '#03b5d3',
        'on-secondary': '#003640',
        'on-secondary-container': '#00424e',
        'secondary-fixed': '#acedff',
        'secondary-fixed-dim': '#4cd7f6',

        tertiary: '#ffb690',
        'tertiary-container': '#ec6a06',
        'tertiary-fixed': '#ffdbca',
        'tertiary-fixed-dim': '#ffb690',

        error: '#ffb4ab',
        'error-container': '#93000a',

        // German Noun Genders
        'gender-der': '#38bdf8',
        'gender-die': '#fb7185',
        'gender-das': '#34d399',
        'gender-plural': '#c084fc',

        // Diff Feedback
        'diff-match': '#22c55e',
        'diff-warn': '#eab308',
        'diff-error': '#ef4444',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        transcription: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
