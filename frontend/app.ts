import {initShopsPage} from "./src/pages/shops";
import { initCartPage } from "./src/pages/checkout";
import { initCouponsPage } from "./src/pages/coupons";
import { initHistoryPage } from "./src/pages/history";

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    if (path.includes("index.html") || path === "/") initShopsPage();
    else if (path.includes('shopping_cart.html')) initCartPage();
    else if (path.includes('coupons.html')) initCouponsPage();
    else if (path.includes('history.html')) initHistoryPage();
});
