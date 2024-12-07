import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import ImageUpload from '../components/ImageUpload';
import { uploadMultipleImages } from '../utils/cloudinary';

const SiteDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
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
    category: '',
    images: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const calculateOriginalPrice = (price) => {
    return (parseFloat(price) * (1 + markupPercentage / 100)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(calculateOriginalPrice(formData.price)),
        stock: parseInt(formData.stock)
      };

      let savedProduct;
      
      if (editingProduct) {
        // Update existing product
        savedProduct = await api.put(`/products/${editingProduct._id}`, productData);
        
        // Handle image changes if any
        const newImages = formData.images.filter(img => img.isNew);
        const existingImages = formData.images.filter(img => img.isExisting);
        
        if (newImages.length > 0) {
          // Upload new images to Cloudinary
          const uploadedImages = await uploadMultipleImages(newImages.map(img => img.file));
          
          // Add new images to the product
          await api.post(`/products/${savedProduct._id}/images`, {
            images: uploadedImages
          });
        }
        
        // If order changed or images were removed, update the order
        if (newImages.length > 0 || existingImages.length !== editingProduct.images?.length) {
          await api.patch(`/products/${savedProduct._id}/images/reorder`, {
            imageOrder: formData.images.map(img => img.isNew ? img.url : img.publicId)
          });
        }
      } else {
        // Create new product
        savedProduct = await api.post('/products', productData);
        
        // Handle new images
        if (formData.images.length > 0) {
          // Upload images to Cloudinary
          const uploadedImages = await uploadMultipleImages(formData.images.map(img => img.file));
          
          // Add images to the product
          await api.post(`/products/${savedProduct._id}/images`, {
            images: uploadedImages
          });
        }
      }

      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        images: []
      });
      setEditingProduct(null);
      
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
      category: product.category?._id || '',
      images: product.images || []
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

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const totalRows = results.data.length;
          let processed = 0;
          
          for (const row of results.data) {
            try {
              // Skip empty rows
              if (!row.name || !row.price) continue;

              const productData = {
                name: row.name,
                description: row.description,
                price: parseFloat(row.price),
                originalPrice: parseFloat(row.price) * (1 + markupPercentage / 100),
                stock: parseInt(row.stock),
                category: categories.find(c => c.name === row.category)?._id
              };

              await api.post('/products', productData);
              processed++;
              setUploadProgress((processed / totalRows) * 100);
            } catch (error) {
              console.error(`Error adding product ${row.name}:`, error);
            }
          }
          
          setIsUploading(false);
          fetchProducts();
          alert(`Successfully imported ${processed} products`);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setIsUploading(false);
          alert('Error parsing CSV file');
        }
      });
    }
  }, [categories, markupPercentage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const dropzoneStyles = `
    border-2 border-dashed rounded-lg p-4 mb-8 text-center
    ${isDragActive ? 'border-primary-100 bg-primary-100/10' : 'border-text-200'}
    ${isUploading ? 'opacity-50' : 'hover:border-primary-100'}
  `;

  const handleProductSelect = (productId, event) => {
    const newSelected = new Set(selectedProducts);
    
    if (event.shiftKey && selectedProducts.size > 0) {
      // Get the last selected product index
      const productIds = products.map(p => p._id);
      const lastSelected = Array.from(selectedProducts)[selectedProducts.size - 1];
      const lastIndex = productIds.indexOf(lastSelected);
      const currentIndex = productIds.indexOf(productId);
      
      // Select all products between last selected and current
      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      
      for (let i = start; i <= end; i++) {
        newSelected.add(productIds[i]);
      }
    } else if (event.ctrlKey || event.metaKey) {
      // Toggle selection
      if (newSelected.has(productId)) {
        newSelected.delete(productId);
      } else {
        newSelected.add(productId);
      }
    } else {
      // Single select
      newSelected.clear();
      newSelected.add(productId);
    }
    
    setSelectedProducts(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.size} selected products?`)) {
      try {
        const deletePromises = Array.from(selectedProducts).map(productId =>
          api.delete(`/products/${productId}`)
        );
        
        await Promise.all(deletePromises);
        setSelectedProducts(new Set());
        fetchProducts();
      } catch (error) {
        console.error('Error deleting products:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text-100 mb-8">Site Dashboard</h1>

        {/* CSV Drop Zone */}
        <div
          {...getRootProps()}
          className={dropzoneStyles}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div>
              <p className="text-text-100 mb-2">Uploading products...</p>
              <div className="w-full bg-bg-300 rounded-full h-2.5">
                <div 
                  className="bg-primary-100 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : isDragActive ? (
            <p className="text-text-100">Drop your CSV file here...</p>
          ) : (
            <p className="text-text-100">
              Drag and drop a CSV file here, or click to select a file
            </p>
          )}
        </div>

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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-200">
                Product Images
              </label>
              <ImageUpload 
                images={formData.images}
                existingImages={editingProduct?.images || []}
                onImagesChange={handleImagesChange}
              />
            </div>
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
                      category: '',
                      images: []
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
            <div className="flex items-center space-x-4">
              {selectedProducts.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-1 rounded bg-red-600 text-text-100 hover:bg-red-700 flex items-center space-x-2"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                  <span>Delete Selected ({selectedProducts.size})</span>
                </button>
              )}
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
                    <tr 
                      key={product._id} 
                      className={`
                        border-b border-bg-300 cursor-pointer hover:bg-bg-300/50 transition-colors select-none
                        ${selectedProducts.has(product._id) ? 'bg-primary-100/10' : ''}
                      `}
                      onClick={(e) => handleProductSelect(product._id, e)}
                    >
                      <td className="py-3 px-4 text-text-100">{product.name}</td>
                      <td className="py-3 px-4 text-text-100">${product.price}</td>
                      <td className="py-3 px-4 text-text-100">${product.originalPrice}</td>
                      <td className="py-3 px-4 text-text-100">{product.stock}</td>
                      <td className="py-3 px-4 text-text-100">{product.category?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Image indicator */}
                          {product.images?.length > 0 ? (
                            <span 
                              className="inline-flex items-center px-2 py-1 rounded bg-bg-300 text-text-200"
                              title={`${product.images.length} image${product.images.length === 1 ? '' : 's'}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                />
                              </svg>
                              <span className="ml-1">{product.images.length}</span>
                            </span>
                          ) : (
                            <span 
                              className="inline-flex items-center px-2 py-1 rounded bg-bg-300/50 text-text-200/50"
                              title="No images"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                />
                              </svg>
                              <span className="ml-1">0</span>
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(product);
                            }}
                            className="px-4 py-1 rounded bg-primary-100 text-text-100 hover:bg-primary-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product._id);
                            }}
                            className="px-4 py-1 rounded bg-red-600 text-text-100 hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
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