import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                cart: resolve(__dirname, 'shopping_cart.html'),
                history: resolve(__dirname, 'history.html'),
                coupons: resolve(__dirname, 'coupons.html')
            }
        }
    }
});