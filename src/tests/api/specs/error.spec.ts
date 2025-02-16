//import { test, expect } from '@playwright/test';
import { test, expect } from "../../hooks";
import { APIHelper } from '../helpers/api.helper';

let apiHelper: APIHelper;

test.describe('API Error Scenarios', () => {
    test.beforeEach(async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'API Error Handling Test Suite'
        });
        apiHelper = new APIHelper();
        await apiHelper.init();
    });

    test.afterEach(async () => {
        await apiHelper.dispose();
    });

    test('should handle minimal post creation with only userId', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'POST /posts - Handle minimal post creation'
        });

        const minimalPost = {
            userId: 1
        };

        const response = await apiHelper.createPost(minimalPost as any);
        const data = await response.json();
        
        // JSONPlaceholder returns exactly what we send plus an ID
        expect(response.ok()).toBeTruthy();
        expect(data).toEqual({
            userId: 1,
            id: expect.any(Number)
        });
    });

    test('should handle post update with partial data', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'PUT /posts/{id} - Handle partial update data'
        });

        const postId = 1;
        const partialUpdate = {
            title: 'Updated Title'
        };

        const response = await apiHelper.updatePost(postId, partialUpdate);
        const data = await response.json();
        
        expect(response.ok()).toBeTruthy();
        expect(data.id).toBe(postId);
        expect(data.title).toBe('Updated Title');
    });

    test('should handle malformed request', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'GET /posts/{id} - Handle malformed request'
        });

        const postId = 'invalid-id'; // Should be number
        const response = await apiHelper.getPost(postId as any);
        
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(404);
    });

    test('should handle non-existent endpoints', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'GET /invalid - Handle non-existent endpoint'
        });

        const response = await apiHelper.getInvalidEndpoint();
        expect(response.status()).toBe(404);
    });

    test('should validate response headers', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'Validate API response headers'
        });

        const response = await apiHelper.getResponseHeaders();
        expect(response.headers()['content-type']).toContain('application/json');
    });

    test('should maintain data consistency in response for complete data', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'Verify data consistency in API response'
        });

        const testPost = {
            title: 'Test Post',
            body: 'Test Body',
            userId: 1
        };

        const response = await apiHelper.createPost(testPost);
        const data = await response.json();
        
        expect(response.ok()).toBeTruthy();
        expect(data).toEqual({
            ...testPost,
            id: expect.any(Number)
        });
    });

    test('should handle empty update data', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'PUT /posts/{id} - Handle empty update data'
        });

        const postId = 1;
        const emptyUpdate = {};

        const response = await apiHelper.updatePost(postId, emptyUpdate);
        const data = await response.json();
        
        expect(response.ok()).toBeTruthy();
        expect(data.id).toBe(postId);
    });

    /**
     * @description This test is intentionally designed to fail for demonstration purposes
     */
    test('intentionally failing test - expect specific ID that cannot exist', async () => {
        test.info().annotations.push({
            type: 'api',
            description: 'Intentionally failing test for demonstration'
        });

        test.info().annotations.push({
            type: 'notice',
            description: 'This test is intentionally failing to demonstrate error reporting'
        });

        const testPost = {
            title: 'Intentionally Failing Test',
            body: 'This test is designed to fail for demonstration purposes',
            userId: 1
        };

        const response = await apiHelper.createPost(testPost);
        const data = await response.json();
        
        expect(data.id).toBe(42);  // This will always fail as JSONPlaceholder generates IDs > 100
    });
});