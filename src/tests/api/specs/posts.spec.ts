//import { test, expect } from '@playwright/test';
import { test, expect } from "../../hooks";
import { APIHelper } from '../helpers/api.helper';
import { Post } from '../../../core/types/api.types';

let apiHelper: APIHelper;

test.describe('Posts API Tests', () => {
    test.beforeEach(async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'API Test Suite for JSONPlaceholder Posts Endpoints'
        });
        apiHelper = new APIHelper();
        await apiHelper.init();
    });

    test.afterEach(async () => {
        await apiHelper.dispose();
    });

    test('should get all posts', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'GET /posts - Retrieve all posts'
        });
        
        const response = await apiHelper.getAllPosts();
        
        expect(response.ok()).toBeTruthy();
        const posts = await response.json() as Post[];
        expect(Array.isArray(posts)).toBeTruthy();
        expect(posts.length).toBeGreaterThan(0);
        
        // Validate structure of first post
        apiHelper.validatePostStructure(posts[0]);
    });

    test('should get a single post', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'GET /posts/{id} - Retrieve single post'
        });
        
        const postId = 1;
        const response = await apiHelper.getPost(postId);
        
        expect(response.ok()).toBeTruthy();
        const post = await response.json() as Post;
        expect(post.id).toBe(postId);
        apiHelper.validatePostStructure(post);
    });

    test('should create a new post', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'POST /posts - Create new post'
        });
        
        const newPost = {
            title: 'New Test Post',
            body: 'This is a test post body',
            userId: 1
        };

        const response = await apiHelper.createPost(newPost);
        
        expect(response.ok()).toBeTruthy();
        const createdPost = await response.json() as Post;
        expect(createdPost.title).toBe(newPost.title);
        expect(createdPost.body).toBe(newPost.body);
        expect(createdPost.userId).toBe(newPost.userId);
        expect(createdPost.id).toBeDefined();
    });

    test('should update an existing post', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'PUT /posts/{id} - Update existing post'
        });
        
        const postId = 1;
        const updateData = {
            title: 'Updated Title',
            body: 'Updated body content'
        };

        const response = await apiHelper.updatePost(postId, updateData);
        
        expect(response.ok()).toBeTruthy();
        const updatedPost = await response.json() as Post;
        expect(updatedPost.title).toBe(updateData.title);
        expect(updatedPost.body).toBe(updateData.body);
        expect(updatedPost.id).toBe(postId);
    });

    test('should delete a post', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'DELETE /posts/{id} - Delete existing post'
        });
        
        const postId = 1;
        const response = await apiHelper.deletePost(postId);
        
        expect(response.ok()).toBeTruthy();
    });

    test('should handle non-existent post', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'GET /posts/{id} - Handle non-existent post'
        });
        
        const nonExistentId = 99999;
        const response = await apiHelper.getPost(nonExistentId);
        
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(404);
    });

    test('should validate post structure', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'Validate post data structure and types'
        });
        
        const response = await apiHelper.getAllPosts();
        const posts = await response.json() as Post[];
        
        for (const post of posts.slice(0, 5)) { // Check first 5 posts
            apiHelper.validatePostStructure(post);
            expect(typeof post.title).toBe('string');
            expect(typeof post.body).toBe('string');
            expect(typeof post.userId).toBe('number');
            expect(typeof post.id).toBe('number');
        }
    });
});