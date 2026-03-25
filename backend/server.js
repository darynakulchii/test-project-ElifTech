require('dotenv').config();
const cors = require('cors')
const {Pool} = require('pg');
const express = require('express');
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

        if (minRating && maxRating) {
            query += ` WHERE rating >= $1 AND rating <= $2`;
            values.push(minRating, maxRating);
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
        let query = 'SELECT * FROM products WHERE 1=1';
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





