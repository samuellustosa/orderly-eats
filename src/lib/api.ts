const API_BASE = 'http://localhost:3333';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(error.message || `Erro ${response.status}`);
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  // Auth
  signup(data: { email: string; password: string }) {
    return this.request<{ token: string }>('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  login(data: { email: string; password: string }) {
    return this.request<{ token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  createStore(data: { name: string; slug: string; phone: string; niche: string; password: string }) {
    return this.request<{ token: string }>('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Products
  getProducts() {
    return this.request<Product[]>('/products');
  }

  createProduct(data: Omit<Product, 'id' | 'imageUrl' | 'isActive'>) {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateProduct(id: string, data: Partial<Product>) {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, { method: 'DELETE' });
  }

  toggleProductStatus(id: string, isActive: boolean) {
    return this.request<Product>(`/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  uploadProductImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ imageUrl: string }>(`/products/${id}/image`, {
      method: 'POST',
      body: formData,
    });
  }

  // Categories
  createCategory(data: { name: string }) {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Orders
  getOrders() {
    return this.request<Order[]>('/orders');
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.request<Order>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Public Menu
  getMenu(slug: string) {
    return this.request<MenuData>(`/menu/${slug}`);
  }

  createOrder(data: CreateOrderData) {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();

// Types
export type OrderStatus = 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface MenuData {
  store: {
    id: string;
    name: string;
    slug: string;
    phone: string;
    niche: string;
  };
  products: Product[];
  categories: Category[];
}

export interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  address: string;
  total: number;
  storeId: string;
  items: { productId: string; quantity: number; price: number }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
