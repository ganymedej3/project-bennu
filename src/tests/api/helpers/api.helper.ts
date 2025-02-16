import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { ENV } from '../../../config/environment.config';
import { Post, CreatePostRequest, UpdatePostRequest } from '../../../core/types/api.types';

export class APIHelper {
  private context!: APIRequestContext;

  constructor(private readonly baseURL: string = ENV.API.baseUrl) {}

  async init() {
    this.context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  async dispose() {
    if (this.context) {
      await this.context.dispose();
    }
  }

  // Get all posts
  async getAllPosts(): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized');
    return this.context.get('/posts');
  }

  // Get single post
  async getPost(id: number): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized');
    return this.context.get(`/posts/${id}`);
  }

  // Create new post
  async createPost(data: CreatePostRequest): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized');
    return this.context.post('/posts', {
      data: data
    });
  }

  // Update post
  async updatePost(id: number, data: UpdatePostRequest): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized');
    return this.context.put(`/posts/${id}`, {
      data: data
    });
  }

  // Delete post
  async deletePost(id: number): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized');
    return this.context.delete(`/posts/${id}`);
  }

  // Helper function to validate post structure
  validatePostStructure(post: Post): void {
    const requiredFields = ['id', 'title', 'body', 'userId'];
    for (const field of requiredFields) {
      if (!(field in post)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  // Error testing methods
  async getInvalidEndpoint(): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized');
    return this.context.get('/invalid-endpoint');
  }

  async getServerError(): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized');
    return this.context.get('/posts?_error=500');
  }

  async getResponseHeaders(): Promise<APIResponse> {
    return this.getAllPosts(); // Reusing existing method for header validation
  }
}