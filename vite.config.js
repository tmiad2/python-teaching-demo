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
            },
        },
    },
});


