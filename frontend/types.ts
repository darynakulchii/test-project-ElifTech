export interface Shop{
    id: number;
    name: string;
    description: string;
    rating: number;
    image_url: string;
}

export interface Product{
    id: number;
    name: string;
    shop_id: number;
    category_id: number;
    price: number;
    description: string;
    image_url: string;
}

export interface Coupon {
    id: number;
    name: string;
    code: string;
    discount_percent: number;
}

export interface CartItem {
    product_id: number;
    quantity: number;
    price: number;
    product_name: string;
    image_url: string;
}

export interface Order {
    name: string;
    email: string;
    phone: string;
    address: string;
    total_price: number;
    items: CartItem[];
    coupon_id?: number | null;
}



