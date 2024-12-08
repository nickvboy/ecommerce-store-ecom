import './style.css';
import { setupProducts } from './products';
import { loadCategories, setupThemeToggle } from './categories';
import { setupImageUpload } from './imageUpload.js';

document.querySelector('#app').innerHTML = `
  <div class="container">
    <div class="flex justify-between items-center mb-8">
      <h1>Product Dashboard</h1>
      <button id="themeToggle" class="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
        <span class="dark:hidden">🌙</span>
        <span class="hidden dark:inline">☀️</span>
        <span class="text-sm font-medium"></span>
      </button>
    </div>
    
    <div class="card">
      <h2>Add New Product</h2>
      <form id="addProductForm" class="space-y-4">
        <div class="form-group">
          <label>Name:</label>
          <input type="text" name="name" required class="mt-1">
        </div>
        <div class="form-group">
          <label>Description:</label>
          <textarea name="description" required rows="3" class="mt-1"></textarea>
        </div>
        <div class="form-group">
          <label>Category:</label>
          <select name="category" required class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="">Select a category...</option>
          </select>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label>Price:</label>
            <input type="number" name="price" step="0.01" required class="mt-1">
          </div>
          <div class="form-group">
            <label>Stock:</label>
            <input type="number" name="stock" required class="mt-1">
          </div>
        </div>
        <div class="form-group">
          <label>Images:</label>
          <div id="imageUploadContainer" class="mt-2">
            <button type="button" id="uploadButton" class="btn">Add Images</button>
            <div id="selectedImages" class="mt-2 grid grid-cols-2 gap-2"></div>
          </div>
        </div>
        <button type="submit" class="btn">Add Product</button>
      </form>
    </div>

    <div class="card">
      <h2>Products</h2>
      <div id="productsList" class="table-container"></div>
      <div class="mt-8 border-t pt-4">
        <button id="deleteAllProducts" class="btn btn-danger">
          Delete All Products
        </button>
      </div>
    </div>
  </div>
`;

// Initialize products, categories, and theme
setupProducts();
loadCategories();
setupThemeToggle();
setupImageUpload(); 