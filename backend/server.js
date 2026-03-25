require('dotenv').config({path:'./backend/.env'});
const cors = require('cors')
const {Pool} = require('pg');
const express = require('express');
const {c} = require("vite/dist/node/chunks/node");
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

pool.connect()
    .then(()=> console.log('Connected to DB'))
    .catch(err=> console.error('Error connecting to DB:', err.stack))

app.listen(3000);

app.get('/api/shops', async (req, res) => {
    try{
        const {minRating, maxRating} = req.query;
        let query = 'SELECT * FROM shops';
        const values = [];
        let valueIndex = 1;

        if (minRating) {
            query += ` AND rating >= $${valueIndex}`;
            values.push(minRating);
            valueIndex++;
        }
        if (maxRating) {
            query += ` AND rating <= $${valueIndex}`;
            values.push(maxRating);
            valueIndex++;
        }

        query += ` ORDER BY id ASC`;
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch(err){
        console.error("Error getting shops",err.message);
        res.status(500).json({error:err.message});
    }
});

app.get('/api/products', async (req, res) => {
    try{
        const {shop_id, category_id, sortBy, order, page = 1, limit = 10} = req.query;
        let query = `SELECT * FROM products WHERE 1=1`;
        const values = [];
        let valueIndex =1;

        if(shop_id){
            query += ` AND shop_id = $${valueIndex}`;
            values.push(shop_id);
            valueIndex ++;
        }

        if(category_id){
            query += ` AND category_id = $${valueIndex}`;
            values.push(category_id);
            valueIndex ++;
        }

        if(sortBy==='price'){
            query += order === 'desc' ? ` ORDER BY  price DESC` : ` ORDER BY  price ASC`;
        } else if(sortBy === 'name'){
            query += ` ORDER BY  name ASC`;
        } else {
            query += ` ORDER BY id ASC`;
        }

        const offset = (page - 1) * limit;
        query += ` LIMIT $${valueIndex} OFFSET $${valueIndex+1}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        res.json(result.rows);

    }catch(err){
        console.error("Error getting products",err.message);
        res.status(500).json({error:err.message});
    }
});

app.get('/api/orders/history', async (req, res) => {
    try {
        const {email, phone, order_id} = req.query;

        if ((!email || !phone) && !order_id) {
            return res.status(400).json({error:"Email and phone is required, or provide an Order ID"});
        }

        const values = [];
        let query = `
            SELECT
                o.id AS order_id,
                o.total_price,
                o.created_at,
                c.email,
                c.phone,
                od.quantity,
                od.price_at_purchase,
                p.id AS product_id,
                p.name AS product_name,
                p.image_url
            FROM orders o 
            JOIN customers c ON c.id = o.customer_id 
            JOIN order_details od ON o.id=od.order_id
            JOIN products p ON p.id = od.product_id
            WHERE 1=1
            `;

        let valueIndex =1;

        if (email && phone){
            query += ` AND c.email = $${valueIndex} AND c.phone = $${valueIndex+1}`;
            values.push(email, phone);
            valueIndex +=2;
        }

        if(order_id){
            query += ` AND o.id = $${valueIndex}`;
            values.push(order_id);
            valueIndex++;
        }

        query += ` ORDER BY o.created_at DESC`;
        const result = await pool.query(query, values);
        res.json(result.rows);

    }catch(err){
        console.error("Error getting history",err.message);
        res.status(500).json({error:err.message});
    }
});

app.get('/api/coupons', async (req, res) => {

});

app.get('api/coupons/validate/:code', async (req, res) => {

});

app.post('/api/orders', async (req, res) => {

});







