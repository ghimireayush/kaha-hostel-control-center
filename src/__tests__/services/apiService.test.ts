import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiService } from '../../services/apiService';
import { ApiError } from '../../utils/errorHandler';

// Mock fetch globally
global.fetch = vi.fn();

describe('ApiService', () => {
  let apiService: ApiService;

  beforeEach(() => {
    apiService = ApiService.getInstance();
    vi.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: '1', name: 'Test Student' };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: mockData }),
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await apiService.get('/students/1');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/hostel/api/v1/students/1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
        })
      );

      expect(result).toEqual(mockData);
    });

    it('should handle query parameters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: [] }),
      };

      (fetch as any).mockResolvedValue(mockResponse);

      await apiService.get('/students', { search: 'John', status: 'Active' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/hostel/api/v1/students?search=John&status=Active',
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: vi.fn().mockResolvedValue({ message: 'Student not found' }),
      };

      (fetch as any).mockResolvedValue(mockResponse);

      await expect(apiService.get('/students/999')).rejects.toThrow(ApiError);
    }, 10000);

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(apiService.get('/students')).rejects.toThrow(
        'Network connection failed'
      );
    }, 10000);
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const mockData = { id: '1', name: 'New Student' };
      const postData = { name: 'New Student', email: 'test@example.com' };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: mockData }),
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await apiService.post('/students', postData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/hostel/api/v1/students',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toEqual(mockData);
    });
  });

  describe('Response format handling', () => {
    it('should handle data format', async () => {
      const mockData = { id: '1', name: 'Test' };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: mockData }),
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await apiService.get('/test');
      expect(result).toEqual(mockData);
    });

    it('should handle result format', async () => {
      const mockData = { id: '1', name: 'Test' };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ result: mockData }),
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await apiService.get('/test');
      expect(result).toEqual(mockData);
    });

    it('should handle stats format', async () => {
      const mockData = { total: 10, active: 8 };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ stats: mockData }),
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await apiService.get('/test');
      expect(result).toEqual(mockData);
    });
  });

  describe('Health check', () => {
    it('should return true for successful health check', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ status: 'ok' }),
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await apiService.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false for failed health check', async () => {
      (fetch as any).mockRejectedValue(new Error('Connection failed'));

      const result = await apiService.healthCheck();
      expect(result).toBe(false);
    }, 10000);
  });
});