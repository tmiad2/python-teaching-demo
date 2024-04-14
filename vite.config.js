import { defineConfig } from "vite";
import { resolve } from 'path'


// https://vitejs.dev/config/
export default defineConfig({
    base: "/teaching/",
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                problem1code: resolve(__dirname, 'problem1code.html'),
                problem1: resolve(__dirname, 'problem1.html'),
                problem2code: resolve(__dirname, 'problem2code.html'),
                problem2: resolve(__dirname, 'problem2.html'),
                problem3code: resolve(__dirname, 'problem3code.html'),
                problem3: resolve(__dirname, 'problem3.html'),
                problem4code: resolve(__dirname, 'problem4code.html'),
                problem4: resolve(__dirname, 'problem4.html'),
            },
        },
    },
});


