import api from '../lib/axios';

const apiClient = {
  // Auth
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { fullName: string; email: string; password: string; role?: string }) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),

  // Clients
  getClients: (params?: object) => api.get('/clients', { params }),
  getClient: (id: number) => api.get(`/clients/${id}`),
  createClient: (data: object) => api.post('/clients', data),
  updateClient: (id: number, data: object) => api.put(`/clients/${id}`, data),
  deleteClient: (id: number) => api.delete(`/clients/${id}`),

  // Prescriptions
  getPrescriptions: (params?: object) => api.get('/prescriptions', { params }),
  createPrescription: (data: object) => api.post('/prescriptions', data),
  updatePrescription: (id: number, data: object) => api.put(`/prescriptions/${id}`, data),
  deletePrescription: (id: number) => api.delete(`/prescriptions/${id}`),

  // Products
  getProducts: (params?: object) => api.get('/products', { params }),
  createProduct: (data: object) => api.post('/products', data),
  updateProduct: (id: number, data: object) => api.put(`/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/products/${id}`),

  // Suppliers
  getSuppliers: (params?: object) => api.get('/suppliers', { params }),
  getSupplier: (id: number) => api.get(`/suppliers/${id}`),
  createSupplier: (data: object) => api.post('/suppliers', data),
  updateSupplier: (id: number, data: object) => api.put(`/suppliers/${id}`, data),
  deleteSupplier: (id: number) => api.delete(`/suppliers/${id}`),

  // Orders
  getOrders: (params?: object) => api.get('/orders', { params }),
  getOrder: (id: number) => api.get(`/orders/${id}`),
  createOrder: (data: object) => api.post('/orders', data),
  updateOrder: (id: number, data: object) => api.put(`/orders/${id}`, data),

  // Payments
  createPayment: (data: object) => api.post('/payments', data),
  getOrderPayments: (orderId: number) => api.get(`/payments/order/${orderId}`),

  // Insurance
  getInsuranceFiles: (params?: object) => api.get('/insurance', { params }),
  createInsuranceFile: (data: object) => api.post('/insurance', data),
  updateInsuranceFile: (id: number, data: object) => api.put(`/insurance/${id}`, data),

  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats'),
};

export default apiClient;
