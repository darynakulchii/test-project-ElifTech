import { api } from "../api";
import { cartManager } from "../cart";
import { Order, CartItem } from "../../types";

let discountedPrice: number | null = null;
let discountPercentValue: number = 0;

const knownCoupons = [
    { code: 'WELCOME10', discountPercent: 10 },
    { code: 'HAPPY20', discountPercent: 20 },
    { code: 'CRAZY50', discountPercent: 50 }
];

const nodes = {
    get cartList() { return document.getElementById("cart-items-list"); },
    get totalPrice() { return document.getElementById("total-price-display"); },
    get orderForm() { return document.getElementById("order-form") as HTMLFormElement; },
    get couponInput() { return document.getElementById("coupon") as HTMLInputElement; },
    get discountSummary() { return document.getElementById("discount-summary"); },
    get originalPrice() { return document.getElementById("original-price"); },
    get discountAmount() { return document.getElementById("discount-amount"); },
    get discountPercentNode() { return document.getElementById("discount-percent"); },
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

    nodes.couponInput?.addEventListener("blur", () => {
        applyCoupon();
    });

    nodes.couponInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            applyCoupon();
        }
    });
}

function getCartTotal(): number {
    return cartManager.getContents().reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function renderCheckout() {
    if (!nodes.cartList || !nodes.totalPrice) return;

    const items = cartManager.getContents();

    if (items.length === 0) {
        nodes.cartList.innerHTML = '<p class="empty-msg">Your cart is empty</p>';
        nodes.totalPrice.innerText = "Total price: 0.00 ₴";
        if (nodes.discountSummary) nodes.discountSummary.style.display = 'none';
        return;
    }

    nodes.cartList.innerHTML = items.map(item => `
        <div class="cart-item" style="display: flex; gap: 1rem; border: 1px solid #eee; padding: 1rem; margin-bottom: 1rem; position: relative;">
            <img src="${item.image_url || 'https://via.placeholder.com/150'}" alt="${item.product_name}" style="width: 100px; height: 100px; object-fit: cover;">
            <div class="cart-item-details" style="flex: 1;">
                <button onclick="window.removeCartItem(${item.product_id})" style="position: absolute; right: 10px; top: 10px; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                <h4>${item.product_name}</h4>
                <p class="price">${(item.price * item.quantity).toFixed(2)} ₴</p>
                <div class="quantity-control">
                    <button onclick="window.updateCartQuantity(${item.product_id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="window.updateCartQuantity(${item.product_id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
        </div>
    `).join("");

    applyCoupon();
}

function applyCoupon() {
    if (!nodes.couponInput || !nodes.totalPrice) return;

    const couponCode = nodes.couponInput.value.trim().toUpperCase();
    const originalTotalPrice = getCartTotal();

    if (!couponCode) {
        discountedPrice = null;
        discountPercentValue = 0;
        if (nodes.discountSummary) nodes.discountSummary.style.display = 'none';
        nodes.totalPrice.innerText = `Total price: ${originalTotalPrice.toFixed(2)} ₴`;
        nodes.totalPrice.style.color = 'inherit';
        return;
    }

    const matchedCoupon = knownCoupons.find(c => c.code === couponCode);

    if (matchedCoupon) {
        discountPercentValue = matchedCoupon.discountPercent;
        const discountVal = originalTotalPrice * (discountPercentValue / 100);
        discountedPrice = originalTotalPrice - discountVal;

        if (nodes.discountSummary) {
            nodes.discountSummary.style.display = 'block';
            if (nodes.originalPrice) nodes.originalPrice.innerText = `${originalTotalPrice.toFixed(2)} ₴`;
            if (nodes.discountAmount) nodes.discountAmount.innerText = `${discountVal.toFixed(2)} ₴`;
            if (nodes.discountPercentNode) nodes.discountPercentNode.innerText = `${discountPercentValue}%`;
        }

        nodes.totalPrice.innerText = `Total price: ${discountedPrice.toFixed(2)} ₴`;
        nodes.totalPrice.style.color = '#10b981';
    } else {
        discountedPrice = null;
        discountPercentValue = 0;
        if (nodes.discountSummary) nodes.discountSummary.style.display = 'none';
        nodes.totalPrice.innerText = `Total price: ${originalTotalPrice.toFixed(2)} ₴`;
    }
}

async function handleOrderSubmit() {
    const items = cartManager.getContents();
    if (items.length === 0) {
        alert("Add items to your cart");
        return;
    }

    const formData = new FormData(nodes.orderForm);
    const orderData: Order = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        total_price: discountedPrice !== null ? discountedPrice : getCartTotal(),
        items: items.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
            product_name: i.product_name,
            image_url: i.image_url
        }))
    };

    if (!orderData.name || !orderData.email || !orderData.phone || !orderData.address) {
        alert("Please fill out all the fields");
        return;
    }

    try {
        const response = await api.createOrder(orderData);
        if (response.ok) {
            alert("Order success!");
            cartManager.clear();
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error(error);
    }
}

(window as any).updateCartQuantity = (id: number, qty: number) => {
    cartManager.updateQty(id, qty);
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