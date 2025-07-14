// API Service Layer - Simulates backend calls with realistic delays
export class ApiService {
  private static instance: ApiService;
  private baseDelay = 500; // Simulate network latency

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private delay(ms: number = this.baseDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulate GET request
  async get<T>(endpoint: string, data?: T): Promise<T> {
    await this.delay();
    console.log(`[API] GET ${endpoint}`, data);
    
    if (Math.random() < 0.05) { // 5% chance of network error
      throw new Error(`Network error: Failed to fetch ${endpoint}`);
    }
    
    return data as T;
  }

  // Simulate POST request
  async post<T>(endpoint: string, data: T): Promise<T> {
    await this.delay(600);
    console.log(`[API] POST ${endpoint}`, data);
    
    if (Math.random() < 0.03) { // 3% chance of server error
      throw new Error(`Server error: Failed to create resource at ${endpoint}`);
    }
    
    return data;
  }

  // Simulate PUT request
  async put<T>(endpoint: string, data: T): Promise<T> {
    await this.delay(400);
    console.log(`[API] PUT ${endpoint}`, data);
    
    if (Math.random() < 0.02) { // 2% chance of update error
      throw new Error(`Update error: Failed to update resource at ${endpoint}`);
    }
    
    return data;
  }

  // Simulate DELETE request
  async delete(endpoint: string, id: string): Promise<void> {
    await this.delay(300);
    console.log(`[API] DELETE ${endpoint}/${id}`);
    
    if (Math.random() < 0.01) { // 1% chance of delete error
      throw new Error(`Delete error: Failed to delete resource ${id}`);
    }
  }
}

export const apiService = ApiService.getInstance();