const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API base URL
const API_URL = 'http://localhost:5000/api';

// Routes
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/products`);
        res.render('index', { products: response.data.products });
    } catch (error) {
        res.render('index', { products: [], error: error.message });
    }
});

// Create product
app.post('/products', async (req, res) => {
    try {
        await axios.post(`${API_URL}/products`, req.body);
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete product
app.post('/products/:id/delete', async (req, res) => {
    try {
        await axios.delete(`${API_URL}/products/${req.params.id}`);
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update product
app.post('/products/:id/update', async (req, res) => {
    try {
        await axios.put(`${API_URL}/products/${req.params.id}`, req.body);
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Dashboard running on http://localhost:${PORT}`);
}); 