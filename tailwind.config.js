import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#1a237e",
                "secondary": "#0d47a1",
                "background-light": "#f8fafc",
                "background-dark": "#0f172a"
            },
            fontFamily: {
                "sans": ["Inter", "system-ui", "sans-serif"],
                "display": ["Inter", "system-ui", "sans-serif"],
            }
        },
    },
    plugins: [
        forms,
        containerQueries
    ],
}
