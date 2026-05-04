import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
/* ************************************ */
// Replace with your PC's IP address
const BASE_URL = __DEV__
  ? 'http://192.168.1.2:5000/api'
  : 'https://clothing-app-backend-production.up.railway.app/api';
  
const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Token error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Categories
export const getCategories = (params) => api.get('/categories', { params });
export const getCategoryById = (id) => api.get(`/categories/${id}`);
export const createCategory = (data) => api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Cart
export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart/add', data);
export const updateCartItem = (data) => api.put('/cart/update', data);
export const removeFromCart = (productId, size) => api.delete(`/cart/remove/${productId}/${size}`);
export const clearCart = () => api.delete('/cart/clear');

// Orders
export const placeOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/my');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id) => api.delete(`/orders/${id}`);
export const getAllOrders = () => api.get('/orders/all');          // updated to /all
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

// Reviews
export const getProductReviews = (productId) => api.get(`/reviews/product/${productId}`);
export const addReview = (data) => api.post('/reviews', data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Profile
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const changePassword = (data) => api.put('/profile/change-password', data);
export const deleteAccount = () => api.delete('/profile');

export default api;