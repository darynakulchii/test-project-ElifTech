import { api } from "../api";
import { cartManager } from "../cart";

const nodes = {
    get form() { return document.getElementById("search-history-form") as HTMLFormElement; },
    get emailInput() { return document.getElementById("search-email") as HTMLInputElement; },
    get phoneInput() { return document.getElementById("search-phone") as HTMLInputElement; },
    get ordersList() { return document.getElementById("orders-list"); }
};

export function initHistoryPage() {
    nodes.form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        await searchHistory();
    });
}

async function searchHistory() {
    const email = nodes.emailInput?.value.trim() || "";
    const phone = nodes.phoneInput?.value.trim() || "";

    if (!email || !phone) {
        alert("Enter email and phone to search");
        return;
    }

    try {
        if (nodes.ordersList) {
            nodes.ordersList.innerHTML = '<p>Search for orders...</p>';
        }

        // Формуємо запит до бекенду
        const query = `email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`;
        const orders = await api.getOrderHistory(query);

        renderHistory(orders);
    } catch (error) {
        console.error("Error loading history:", error);
        if (nodes.ordersList) {
            nodes.ordersList.innerHTML = '<p class="error-msg">Unable to load order history.</p>';
        }
    }
}

function renderHistory(orders: any[]) {
    if (!nodes.ordersList) return;

    if (orders.length === 0) {
        nodes.ordersList.innerHTML = '<p class="empty-msg">No orders found</p>';
        return;
    }

    const groupedOrders = orders.reduce((acc: any, curr: any) => {
        if (!acc[curr.order_id]) {
            acc[curr.order_id] = { ...curr, items: [] };
        }
        acc[curr.order_id].items.push(curr);
        return acc;
    }, {});

    nodes.ordersList.innerHTML = Object.values(groupedOrders).map((order: any) => `
        <div class="order-card" style="border: 1px solid #e5e7eb; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
            <div class="order-header" style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                <h4>Order #${order.order_id}</h4>
                <span style="color: #666;">Date: ${new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            
            <div class="order-items" style="margin-bottom: 1rem;">
                ${order.items.map((item: any) => `
                    <div class="history-product" style="display: flex; align-items: center; gap: 10px; margin-bottom: 0.5rem;">
                        <img src="${item.image_url || 'https://via.placeholder.com/50'}" width="50" style="border-radius: 4px;" alt="${item.product_name}">
                        <span>${item.product_name} <strong>x${item.quantity}</strong></span>
                        <span style="margin-left: auto;">${item.price_at_purchase} ₴</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid #eee;">
                <strong>Total: ${order.total_price} ₴</strong>
                <button class="btn-primary" onclick="window.reorderOrder(${order.order_id})">Reorder</button>
            </div>
        </div>
    `).join("");
}

(window as any).reorderOrder = async (orderId: number) => {
    try {
        const orderData = await api.getOrderHistory(`order_id=${orderId}`);
        orderData.forEach((item: any) => {
            for (let i = 0; i < item.quantity; i++) {
                cartManager.addItem({
                    id: item.product_id,
                    name: item.product_name,
                    price: parseFloat(item.price_at_purchase),
                    image_url: item.image_url
                } as any);
            }
        });

        alert("Items from your previous order have been successfully added to your cart! Go to the Shopping Cart.");
    } catch (error) {
        console.error("Reordering error:", error);
        alert("Unable to process your order. Please try again later..");
    }
};