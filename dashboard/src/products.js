import axios from 'axios';
import { loadCategories } from './categories';
import { getSelectedImages, clearSelectedImages } from './imageUpload.js';

const API_URL = '/api';

export async function setupProducts() {
    const productsList = document.getElementById('productsList');
    const addProductForm = document.getElementById('addProductForm');
    const deleteAllBtn = document.getElementById('deleteAllProducts');

    // Add delete all handler
    deleteAllBtn.addEventListener('click', async () => {
        if (!confirm('WARNING: This will permanently delete ALL products. Are you sure?')) {
            return;
        }

        try {
            deleteAllBtn.disabled = true;
            deleteAllBtn.textContent = 'Deleting...';

            // Use the bulk delete endpoint
            await axios.delete(`${API_URL}/products/delete-all`);
            
            alert('Successfully deleted all products');
            await loadProducts();
        } catch (error) {
            alert('Error deleting products: ' + error.message);
        } finally {
            deleteAllBtn.disabled = false;
            deleteAllBtn.textContent = 'Delete All Products';
        }
    });

    // Add price calculation handler
    const priceInput = document.getElementById('priceInput');
    const originalPriceInput = document.getElementById('originalPriceInput');

    priceInput.addEventListener('input', (e) => {
        const price = parseFloat(e.target.value) || 0;
        const markupPrice = price * 1.2; // 20% markup
        originalPriceInput.value = markupPrice.toFixed(2);
    });

    // Allow manual override of original price
    originalPriceInput.addEventListener('focus', function() {
        // Remove the readonly attribute when focused
        this.readOnly = false;
    });

    // Handle form submission
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addProductForm);
        const product = Object.fromEntries(formData.entries());
        
        // Convert price and originalPrice to numbers
        product.price = parseFloat(product.price);
        product.originalPrice = parseFloat(product.originalPrice);
        
        try {
            // First create the product
            const response = await axios.post(`${API_URL}/products`, product);
            const productId = response.data._id;
            
            // Then add images if any are selected
            const selectedImages = getSelectedImages();
            if (selectedImages.length > 0) {
                await axios.post(`${API_URL}/products/${productId}/images`, {
                    images: selectedImages
                });
            }
            
            addProductForm.reset();
            clearSelectedImages();
            await loadProducts();
            await loadCategories();
        } catch (error) {
            alert('Error adding product: ' + error.message);
        }
    });

    // Add export button handler
    const exportBtn = document.getElementById('exportDbButton');
    exportBtn.addEventListener('click', async () => {
        try {
            exportBtn.disabled = true;
            exportBtn.textContent = 'Exporting...';

            // Run the export script directly
            const { exec } = require('child_process');
            const path = require('path');
            
            const scriptPath = path.join(__dirname, '../../backend/scripts/exportCollections.js');
            exec(`node ${scriptPath}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error}`);
                    alert('Error exporting database: ' + error.message);
                    return;
                }
                if (stderr) {
                    console.error(`Stderr: ${stderr}`);
                    return;
                }
                alert('Database exported successfully! Check the backend folder for the JSON file.');
            });

        } catch (error) {
            alert('Error exporting database: ' + error.message);
        } finally {
            exportBtn.disabled = false;
            exportBtn.textContent = 'Export Database';
        }
    });

    // Load initial products
    await loadProducts();

    async function loadProducts() {
        try {
            const response = await axios.get(`${API_URL}/products`);
            displayProducts(response.data.products);
        } catch (error) {
            productsList.innerHTML = `<p class="error">Error loading products: ${error.message}</p>`;
        }
    }

    function displayProducts(products) {
        if (!products.length) {
            productsList.innerHTML = '<p class="text-gray-500 text-center py-4">No products found.</p>';
            return;
        }

        productsList.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Category</th>
                        <th scope="col">Description</th>
                        <th scope="col">Price</th>
                        <th scope="col">Stock</th>
                        <th scope="col" class="relative">
                            <span class="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    ${products.map(product => `
                        <tr>
                            <td class="font-medium text-gray-900">${product.name}</td>
                            <td class="text-gray-500">${product.category ? product.category.name : 'Uncategorized'}</td>
                            <td class="text-gray-500">${product.description}</td>
                            <td class="text-gray-900">$${product.price}</td>
                            <td class="text-gray-900">${product.stock}</td>
                            <td class="text-right space-x-2">
                                <button onclick="window.editProduct('${product._id}')" class="btn">
                                    Edit
                                </button>
                                <button onclick="window.deleteProduct('${product._id}')" class="btn btn-danger">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Add global handlers for edit and delete
    window.editProduct = async (id) => {
        try {
            // Get current product data
            const response = await axios.get(`${API_URL}/products/${id}`);
            const currentProduct = response.data;
            
            // Show current data in prompt
            const productJson = JSON.stringify({
                name: currentProduct.name,
                description: currentProduct.description,
                price: currentProduct.price,
                stock: currentProduct.stock,
                category: currentProduct.category?._id
            }, null, 2);
            
            const updatedData = prompt('Edit product details (JSON format):', productJson);
            
            if (updatedData) {
                const productData = JSON.parse(updatedData);
                await axios.put(`${API_URL}/products/${id}`, productData);
                await loadProducts();
            }
        } catch (error) {
            alert('Error updating product: ' + error.message);
        }
    };

    window.deleteProduct = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/products/${id}`);
                await loadProducts();
            } catch (error) {
                alert('Error deleting product: ' + error.message);
            }
        }
    };
} 