import { CartItem, Product } from "../types";

let cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

export const cartManager = {
    getContents: () => cart,

    addItem(product: Product): boolean {
        if (cart.length > 0 && cart[0].shop_id !== product.shop_id) {
            return false;
        }

        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                product_id: product.id,
                quantity: 1,
                price: product.price,
                product_name: product.name,
                image_url: product.image_url,
                shop_id: product.shop_id
            });
        }
        this.save();
        return true;
    },

    updateQty(id: number, qty: number) {
        const item = cart.find(i => i.product_id === id);
        if (item) {
            item.quantity = Math.max(1, qty);
            this.save();
        }
    },

    clear() {
        cart = [];
        localStorage.removeItem('cart');
    },

    save: () => localStorage.setItem('cart', JSON.stringify(cart))
};