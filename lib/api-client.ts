// API Client for frontend to backend communication

const API_BASE_URL = '/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Client Error:', error);
      return {
        success: false,
        error: error.message || 'Request failed',
      };
    }
  }

  // Trademarks API
  async getTrademarks(params?: {
    category?: string;
    verified?: boolean;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    return this.request(`/trademarks?${queryParams.toString()}`);
  }

  async getTrademark(id: string) {
    return this.request(`/trademarks/${id}`);
  }

  async createTrademark(data: any) {
    return this.request('/trademarks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrademark(id: string, data: any) {
    return this.request(`/trademarks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTrademark(id: string) {
    return this.request(`/trademarks/${id}`, {
      method: 'DELETE',
    });
  }

  async verifyTrademark(params: {
    tokenId?: number;
    registrationNumber?: string;
    companyAddress?: string;
  }) {
    return this.request('/trademarks/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Users API
  async getUser(address: string) {
    return this.request(`/users/${address}`);
  }

  async createOrUpdateUser(address: string, data: any) {
    return this.request(`/users/${address}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Search API
  async search(query: string, params?: {
    category?: string;
    verified?: boolean;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams({ q: query });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    return this.request(`/search?${queryParams.toString()}`);
  }

  // Stats API
  async getStats() {
    return this.request('/stats');
  }

  // Upload API
  async uploadToIPFS(files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/upload/ipfs`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error: any) {
      console.error('Upload Error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  // Notifications API
  async getNotifications(address: string, unreadOnly: boolean = false) {
    const params = new URLSearchParams({ address });
    if (unreadOnly) params.append('unreadOnly', 'true');
    return this.request(`/notifications?${params.toString()}`);
  }

  async getUnreadCount(address: string) {
    return this.request(`/notifications/unread-count?address=${address}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(address: string) {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
      body: JSON.stringify({ address }),
    });
  }

  async createNotification(data: {
    userId: string;
    type?: string;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: string;
    link?: string;
  }) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export default ApiClient;