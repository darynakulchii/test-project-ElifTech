const API_URL = 'https://test-project-eliftech.onrender.com/api';

export const api = {
    async getShops() {
        const res = await fetch(`${API_URL}/shops`);
        return res.json();
    },
    async getProducts(params: { shop_id: number; sortBy?: string; order?: string; category_id?: string }) {
        let url = `${API_URL}/products?shop_id=${params.shop_id}`;
        if (params.sortBy) url += `&sortBy=${params.sortBy}&order=${params.order}`;
        if (params.category_id) url += `&category_id=${params.category_id}`;
        const res = await fetch(url);
        return res.json();
    },
    async createOrder(orderData: any) {
        return fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
    },
    async getOrderHistory(query: string) {
        const res = await fetch(`${API_URL}/orders/history?${query}`);
        return res.json();
    },
    async getCoupons() {
        const res = await fetch(`${API_URL}/coupons`);
        return res.json();
    }
};