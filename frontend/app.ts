import {Shop, Product,Coupon} from "./types";

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    if (path.includes("index.html")||path==="/") {
        initShopsPage();
    } else if (path.includes('shopping_cart.html')) {
        initCartPage();
    } else if (path.includes('coupons.html')) {
        initCouponsPage();
    } else if (path.includes('history.html')) {
        initHistoryPage();
    }
});

const shopContainer = document.getElementById("shops-list") as HTMLDivElement;
const productsContainer = document.getElementById("products-list") as HTMLDivElement;

export async function initShopsPage() {
    await loadShops;
}

async function loadShops() {
    try{
        const response = await fetch('http://localhost:3000/api/shops');
        const shops: Shop[] = await response.json();

        if(shopContainer){
            shopContainer.innerHTML = shops.map(shop =>`
               <button class="shop-btn" onclick="window.loadProducts(${shop.id})">
                    ${shop.name}
                    <span class="rating"> ${shop.rating}</span>
                </button>`).join(" ");
        }
    }catch(e){
        console.error("Error loading shops", e);
    }
}

(window as any).loadProducts = async (shopId:number) => {
    try{
        document.querySelectorAll('.shop-btn').forEach(btn => btn.classList.remove('active'));
        (event?.target as HTMLElement)?.classList.add('active');

        const response = await fetch('http://localhost:3000/api/products?shop_id=${shopId}');
        const products: Product[] = await response.json();
        renderProducts(products);
    }catch(e){
        console.error("Error loading products", e);
    }
};

function renderProducts(products: Product[]) {
    if(!productsContainer){return}
    if(products.length===0){
        productsContainer.innerHTML = '<p class="empty-msg">This shop currently has no items in stock</p>';
        return;
    }

    productsContainer.innerHTML = products.map( product => `
         <div class="product-card">
            <div class="product-img-container">
                <img src="${product.image_url || 'https://via.placeholder.com/200'}" alt="${product.name}">
            </div>
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <p class="price">${product.price} ₴</p>
                <button class="btn-primary" onclick="window.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    Додати в кошик
                </button>
            </div>
        </div>`).join(" ");
}


export async function initCartPage() {}
export async function initCouponsPage() {}
export async function initHistoryPage(){}