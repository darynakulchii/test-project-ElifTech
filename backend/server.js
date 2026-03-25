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



