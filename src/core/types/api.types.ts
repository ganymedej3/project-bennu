// JSONPlaceholder Post Types
export interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

// Request Types
export interface CreatePostRequest {
    userId: number;
    title: string;
    body: string;
}

// Making all fields optional for update requests
export interface UpdatePostRequest {
    title?: string;
    body?: string;
    userId?: number;
}

// Response Types
export interface PostResponse {
    data: Post;
    status: number;
}

export interface PostsResponse {
    data: Post[];
    status: number;
}

// Error Response
export interface APIErrorResponse {
    error: string;
    status: number;
    message: string;
}

// API Test Context
export interface APITestContext {
    authToken?: string;
    baseUrl: string;
    headers: Record<string, string>;
}