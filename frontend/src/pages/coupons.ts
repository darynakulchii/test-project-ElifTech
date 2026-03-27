import { api } from "../api";
import { Coupon } from "../../types";

const nodes = {
    get couponsList() { return document.getElementById("coupons-list"); }
};

export async function initCouponsPage() {
    await renderCoupons();
}

async function renderCoupons() {
    if (!nodes.couponsList) return;

    try {
        nodes.couponsList.innerHTML = '<p>Loading coupons...</p>';

        const coupons: Coupon[] = await api.getCoupons();

        if (coupons.length === 0) {
            nodes.couponsList.innerHTML = '<p class="empty-msg">There are currently no coupons available.</p>';
            return;
        }

        nodes.couponsList.innerHTML = coupons.map((coupon: Coupon) => `
            <div class="coupon-card" style="border: 1px dashed #ea580c; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; background-color: #fff;">
                <div class="coupon-info">
                    <h3 style="margin-bottom: 0.5rem;">${coupon.name}</h3>
                    <p class="coupon-discount" style="margin-bottom: 0.25rem;">Discount: <strong style="color: #ea580c; font-size: 1.2rem;">${coupon.discount_percent}%</strong></p>
                    <p class="coupon-code-text">Код: <code style="background: #f9fafb; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid #e5e7eb;">${coupon.code}</code></p>
                </div>
                <button class="btn-primary" onclick="window.copyCouponCode('${coupon.code}')" style="white-space: nowrap;">
                    Copy Code
                </button>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error loading coupons:", error);
        nodes.couponsList.innerHTML = '<p class="error-msg">Unable to load coupons. Please check your connection to the server.</p>';
    }
}

(window as any).copyCouponCode = async (code: string) => {
    try {
        await navigator.clipboard.writeText(code);
        alert(`Code "${code}" is copied! You can use it when placing your order.`);
    } catch (err) {
        console.error('Coping error:', err);
        const textArea = document.createElement("textarea");
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(`Code "${code}" is copied!`);
    }
};