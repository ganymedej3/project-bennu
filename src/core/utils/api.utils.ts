import { APIResponse, TestError } from '../types';
import { Post, APIErrorResponse } from '../types/api.types';
import { test, expect } from '@playwright/test';

export class APIUtils {
  /**
   * Validates common API response structure
   */
  static validateResponseStructure(response: APIResponse) {
    expect(response).toBeDefined();
    expect(response.status).toBeDefined();
    expect(typeof response.status).toBe('number');
    expect(response.headers).toBeDefined();
  }

  /**
   * Validates Post object structure
   */
  static validatePostStructure(post: Post) {
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('userId');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
  }

  /**
   * Handles API errors and creates a structured error object
   */
  static handleAPIError(error: any): TestError {
    const testError: TestError = {
      name: 'APIError',
      message: error.message || 'Unknown API error',
      type: 'network',
      stack: error.stack,
      context: {}
    };

    if (error.response) {
      testError.context = {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.response.url
      };
    }

    return testError;
  }

  /**
   * Creates request headers with optional authentication
   */
  static createHeaders(authToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
  }

  /**
   * Retries an API call with exponential backoff
   */
  static async retryAPICall<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    let delay = initialDelay;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries - 1) break;
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    throw lastError!;
  }
}