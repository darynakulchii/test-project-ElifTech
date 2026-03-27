import { api } from "../api";
import { cartManager } from "../cart";
import {Shop,Product} from "../../types";

const nodes = {
    get shopList() { return document.getElementById("shops-list"); },
    get productGrid() { return document.getElementById("products-list"); },
    get categoryFilter() { return document.getElementById("category-filter") as HTMLSelectElement; },
    get sortSelect() { return document.getElementById("sort-select") as HTMLSelectElement; },
    get ratingFilter() { return document.getElementById("rating-filter") as HTMLSelectElement; }
};

let currentShopId: number | null = null;

export async function initShopsPage() {
    setupEventListeners();
    await loadShops();
}

function setupEventListeners() {
    nodes.sortSelect?.addEventListener("change", () => {
        if (currentShopId) {
            const [sortBy, order] = nodes.sortSelect.value.split("-");
            refreshProducts(sortBy, order);
        }
    });

    nodes.categoryFilter?.addEventListener("change", () => {
        if (currentShopId) refreshProducts();
    });

    nodes.ratingFilter?.addEventListener("change", async () => {
        const minRating = nodes.ratingFilter.value;
        await loadShops(minRating);
    });
}

async function loadShops(minRating?: string) {
    try {
        const shops: Shop[] = await api.getShops(minRating);

        if (nodes.shopList) {
            nodes.shopList.innerHTML = shops.map(shop => `
                <button class="shop-btn" data-id="${shop.id}" onclick="window.selectShop(${shop.id})">
                    ${shop.name}
                    <span class="rating"> ☆${shop.rating}</span>
                </button>
            `).join("");
        }
    } catch (error) {
        console.error("Error loading shops:", error);
    }
}

async function refreshProducts(sortBy = '', order = '') {
    if (!currentShopId) return;

    const categoryId = nodes.categoryFilter?.value;
    const params = {
        shop_id: currentShopId,
        sortBy: sortBy || nodes.sortSelect.value.split("-")[0],
        order: order || nodes.sortSelect.value.split("-")[1],
        category_id: categoryId !== "" ? categoryId : undefined
    };

    try {
        const products: Product[] = await api.getProducts(params);
        renderProducts(products);
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

function renderProducts(products: Product[]) {
    if (!nodes.productGrid) return;

    if (products.length === 0) {
        nodes.productGrid.innerHTML = '<p class="empty-msg">No products found</p>';
        return;
    }

    nodes.productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image_url || 'https://via.placeholder.com/200'}" alt="${product.name}">
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <p class="price">${product.price} ₴</p>
                <button class="btn-primary" onclick='window.handleAddToCart(${JSON.stringify(product)})'>
                    Add to cart
                </button>
            </div>
        </div>
    `).join("");
}

(window as any).selectShop = (shopId: number) => {
    currentShopId = shopId;

    document.querySelectorAll('.shop-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.shop-btn[data-id="${shopId}"]`)?.classList.add('active');

    refreshProducts();
};

(window as any).handleAddToCart = (product: Product) => {
    const success = cartManager.addItem(product);

    if (success) {
        alert(`${product.name} is added to the cart!`);
    } else {
        const confirmClear = confirm("You can only order items from one store at a time. Would you like to clear your cart to add this item?");
        if (confirmClear) {
            cartManager.clear();
            cartManager.addItem(product);
            alert(`${product.name}  is added to the cart!`);
        }
    }
};