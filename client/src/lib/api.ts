const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      const userId = userData.id || userData._id;
      console.log('Getting auth headers for user:', userData);
      console.log('User ID:', userId);
      return {
        'user-id': userId
      };
    }
    console.log('No user found in localStorage');
    return {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    console.log('API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log('API Response:', {
        status: response.status,
        data
      });
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginData): Promise<ApiResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: SignupData): Promise<ApiResponse> {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Clubs methods
  async getClubs(): Promise<ApiResponse> {
    return this.request('/api/clubs');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // Test authentication
  async testAuth(): Promise<ApiResponse> {
    return this.request('/api/test-auth');
  }

  // Task methods
  async getTasks(): Promise<ApiResponse> {
    return this.request('/api/tasks');
  }

  async createTask(taskData: any): Promise<ApiResponse> {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, updateData: any): Promise<ApiResponse> {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Event methods
  async getEvents(params?: { status?: string; upcoming?: boolean }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.upcoming) queryParams.append('upcoming', 'true');
    
    const query = queryParams.toString();
    return this.request(`/api/events${query ? `?${query}` : ''}`);
  }

  async createEvent(eventData: any): Promise<ApiResponse> {
    return this.request('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Product methods
  async getProducts(): Promise<ApiResponse> {
    return this.request('/api/products');
  }

  async createProduct(productData: any): Promise<ApiResponse> {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // Sales methods
  async getSales(): Promise<ApiResponse> {
    return this.request('/api/sales');
  }

  async createSale(saleData: any): Promise<ApiResponse> {
    return this.request('/api/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  // Proposal methods
  async getProposals(): Promise<ApiResponse> {
    return this.request('/api/proposals');
  }

  async createProposal(proposalData: any): Promise<ApiResponse> {
    return this.request('/api/proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
  }

  async reviewProposal(proposalId: string, reviewData: any): Promise<ApiResponse> {
    return this.request(`/api/proposals/${proposalId}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  // Message methods
  async getMessages(type?: 'sent' | 'received'): Promise<ApiResponse> {
    const query = type ? `?type=${type}` : '';
    return this.request(`/api/messages${query}`);
  }

  async sendMessage(messageData: any): Promise<ApiResponse> {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(messageId: string): Promise<ApiResponse> {
    return this.request(`/api/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // User methods
  async getUsers(role?: string): Promise<ApiResponse> {
    const query = role ? `?role=${role}` : '';
    return this.request(`/api/users${query}`);
  }

  // Default club methods
  async getDefaultClubId(): Promise<ApiResponse> {
    return this.request('/api/default-club-id');
  }

  async initDefaultClub(): Promise<ApiResponse> {
    return this.request('/api/init-default-club', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
