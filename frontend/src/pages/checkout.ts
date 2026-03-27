import { api } from "../api";
import { cartManager } from "../cart";
import { Order, CartItem } from "../../types";

const nodes = {
    get cartList() { return document.getElementById("cart-items-list"); },
    get totalPrice() { return document.getElementById("total-price-display"); },
    get orderForm() { return document.getElementById("order-form") as HTMLFormElement; },
    get couponInput() { return document.getElementById("coupon") as HTMLInputElement; }
};

export function initCartPage() {
    renderCheckout();
    setupEventListeners();
}

function setupEventListeners() {
    nodes.orderForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        await handleOrderSubmit();
    });
}

function renderCheckout() {
    const items: CartItem[] = cartManager.getContents();

    if (!nodes.cartList) return;

    if (items.length === 0) {
        nodes.cartList.innerHTML = '<p class="empty-msg">Your cart is empty</p>';
        if (nodes.totalPrice) nodes.totalPrice.innerText = 'Загальна вартість: 0 ₴';
        return;
    }

    nodes.cartList.innerHTML = items.map((item: CartItem) => `
        <div class="cart-item">
            <img src="${item.image_url || 'https://via.placeholder.com/100'}" alt="${item.product_name}">
            <div class="cart-item-details">
                <h4>${item.product_name}</h4>
                <p class="price">${item.price} ₴</p>
                <div class="quantity-controls">
                    <input type="number" min="1" value="${item.quantity}" 
                           onchange="window.updateCartQty(${item.product_id}, this.value)">
                    <button type="button" class="btn-remove" onclick="window.removeCartItem(${item.product_id})">Delete</button>
                </div>
            </div>
        </div>
    `).join("");

    calculateTotal(items);
}

function calculateTotal(items: CartItem[]) {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (nodes.totalPrice) {
        nodes.totalPrice.innerText = `Total price: ${total.toFixed(2)} ₴`;
    }
}

async function handleOrderSubmit() {
    const items = cartManager.getContents();

    if (items.length === 0) {
        alert("Add items to your cart before placing your order");
        return;
    }

    const formData = new FormData(nodes.orderForm);

    const orderData: Order = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        total_price: parseFloat(nodes.totalPrice?.innerText.replace(/[^0-9.]/g, '') || '0'),
        items: items.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
            product_name: i.product_name,
            image_url: i.image_url
        }))
    };

    if (!orderData.name || !orderData.email || !orderData.phone || !orderData.address) {
        alert("Please fill out all the fields in the form");
        return;
    }

    try {
        const response = await api.createOrder(orderData);
        if (response.ok) {
            alert("Your order has been successfully received!");
            cartManager.clear();
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Sending error:", error);
    }
}

(window as any).updateCartQty = (id: number, value: string) => {
    cartManager.updateQty(id, parseInt(value));
    renderCheckout();
};

(window as any).removeCartItem = (id: number) => {
    const items = cartManager.getContents();
    const index = items.findIndex(i => i.product_id === id);
    if (index > -1) {
        items.splice(index, 1);
        cartManager.save();
        renderCheckout();
    }
};