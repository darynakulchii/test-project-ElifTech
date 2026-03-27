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
            <div class="coupon-ticket">
                <div class="discount-badge">-${coupon.discount_percent}%</div>
                <h3>${coupon.code}</h3>
                <button class="btn-copy" onclick="window.copyCouponCode('${coupon.code}')">
                    Копіювати
                </button>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error loading coupons:", error);
        nodes.couponsList.innerHTML = '<p class="error-msg">Unable to load coupons.</p>';
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