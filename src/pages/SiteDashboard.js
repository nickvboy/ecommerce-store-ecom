import React, { useState, useEffect } from 'react';
import api from '../lib/api';

const SiteDashboard = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [markupPercentage, setMarkupPercentage] = useState(20);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, itemsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching from:', process.env.REACT_APP_API_URL_LOCAL); // Debug log
      const response = await api.get('/products', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sort: '-createdAt'
        }
      });
      
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.totalProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateOriginalPrice = (price) => {
    return (parseFloat(price) * (1 + markupPercentage / 100)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(calculateOriginalPrice(formData.price)),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, data);
      } else {
        await api.post('/products', data);
      }

      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: ''
      });
      setEditingProduct(null);
      
      setCurrentPage(1);
      fetchProducts();
      
      alert(editingProduct ? 'Product updated successfully' : 'Product added successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category?._id || ''
    });
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text-100 mb-8">Site Dashboard</h1>
        
        {/* Product Form */}
        <div className="bg-bg-200 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-text-100 mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Product Name"
                className="w-full px-4 py-2 rounded bg-bg-300 text-text-100 border border-text-200 focus:border-primary-100 focus:outline-none"
                required
              />
              <div className="flex space-x-4">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  className="w-full px-4 py-2 rounded bg-bg-300 text-text-100 border border-text-200 focus:border-primary-100 focus:outline-none"
                  required
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={markupPercentage}
                    onChange={(e) => setMarkupPercentage(parseFloat(e.target.value))}
                    className="w-20 px-2 py-2 rounded bg-bg-300 text-text-100 border border-text-200 focus:border-primary-100 focus:outline-none"
                    placeholder="Markup %"
                  />
                  <span className="text-text-200">% markup</span>
                </div>
              </div>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="Stock"
                className="w-full px-4 py-2 rounded bg-bg-300 text-text-100 border border-text-200 focus:border-primary-100 focus:outline-none"
                required
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded bg-bg-300 text-text-100 border border-text-200 focus:border-primary-100 focus:outline-none"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Product Description"
              className="w-full px-4 py-2 rounded bg-bg-300 text-text-100 border border-text-200 focus:border-primary-100 focus:outline-none h-32"
              required
            />
            {formData.price && (
              <div className="text-text-200">
                Original Price (with {markupPercentage}% markup): ${calculateOriginalPrice(formData.price)}
              </div>
            )}
            <div className="flex justify-end space-x-4">
              {editingProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      stock: '',
                      category: ''
                    });
                  }}
                  className="px-6 py-2 rounded bg-bg-300 text-text-100 hover:bg-bg-200"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 rounded bg-primary-100 text-text-100 hover:bg-primary-200"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>

        {/* Products Table */}
        <div className="bg-bg-200 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-text-100">Products</h2>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded bg-bg-300 text-text-100 border border-text-200 focus:border-primary-100 focus:outline-none"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-4">No products found</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-text-200">
                    <th className="text-left py-3 px-4 text-text-100">Name</th>
                    <th className="text-left py-3 px-4 text-text-100">Price</th>
                    <th className="text-left py-3 px-4 text-text-100">Original Price</th>
                    <th className="text-left py-3 px-4 text-text-100">Stock</th>
                    <th className="text-left py-3 px-4 text-text-100">Category</th>
                    <th className="text-right py-3 px-4 text-text-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id} className="border-b border-bg-300">
                      <td className="py-3 px-4 text-text-100">{product.name}</td>
                      <td className="py-3 px-4 text-text-100">${product.price}</td>
                      <td className="py-3 px-4 text-text-100">${product.originalPrice}</td>
                      <td className="py-3 px-4 text-text-100">{product.stock}</td>
                      <td className="py-3 px-4 text-text-100">{product.category?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-4 py-1 rounded bg-primary-100 text-text-100 hover:bg-primary-200 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="px-4 py-1 rounded bg-red-600 text-text-100 hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-text-200">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 rounded bg-bg-300 text-text-100 hover:bg-bg-200 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || isLoading}
                className="px-4 py-2 rounded bg-bg-300 text-text-100 hover:bg-bg-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDashboard; 