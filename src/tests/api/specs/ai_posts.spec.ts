import { test, expect } from "../../hooks";
import { APIHelper } from "../helpers/api.helper";
import { ApiAIManager } from "../../../ai/api_ai_manager";

let apiHelper: APIHelper;

test.describe("AI-Enhanced Posts API Tests", () => {
  test.beforeEach(async () => {
    // We annotate so we know these tests are API tests
    test.info().annotations.push({
      type: "api",
      description: "AI-Enhanced API Test Suite for JSONPlaceholder Posts",
    });
    apiHelper = new APIHelper();
    await apiHelper.init(); // same pattern as existing specs
  });

  test.afterEach(async () => {
    await apiHelper.dispose();
  });

  /**
   * Demonstrates AI-based test data generation for JSONPlaceholder's `POST /posts`.
   * We'll ask the AI for 3 "post" objects. Then we create each post with `createPost`.
   */
  test("AI-based test data generation for 'posts' resource", async () => {
    // We'll ask the model for 3 post objects
    const resourceName = "jsonplaceholder post"; // you can name it anything that indicates a 'post'
    const count = 3;

    // 1) Generate test data from the new API manager
    const generatedData = await ApiAIManager.generateTestDataForApi(resourceName, count);
    console.log("AI-generated post data:", generatedData);

    // 2) For each object, call the existing APIHelper `createPost` to test the endpoint
    for (const item of generatedData) {
      // Typically, JSONPlaceholder expects { title, body, userId }
      // The AI might produce something like { userId: 123, content: "..."} or different shapes
      // So let's do a partial check or fallback if needed
      const response = await apiHelper.createPost(item as any);
      const data = await response.json();

      // JSONPlaceholder returns a 201 with an ID (≥ 101 typically).
      // We'll confirm the call is OK even if the shape is weird
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);
      // Log or do extra checks
      console.log("Created post with AI data =>", data);
    }
  });

  /**
   * Demonstrates AI-based negative scenario generation for `POST /posts`.
   */
  test("AI-based negative scenarios for 'POST /posts'", async () => {
    // We'll ask the AI for 3 negative scenarios
    const endpointDesc = "POST /posts in JSONPlaceholder";
    const count = 3;

    // 1) Generate negative test scenarios
    const negativeScenarios = await ApiAIManager.generateNegativeScenarios(endpointDesc, count);
    console.log("Negative scenarios from AI:", negativeScenarios);

    // 2) We'll try each scenario by calling createPost. 
    // Realistically, JSONPlaceholder is a mock and might still return 201 
    // for any input, but let's demonstrate the logic
    for (const scenario of negativeScenarios) {
      console.log(`Running negative scenario: ${scenario.description}`);

      const response = await apiHelper.createPost(scenario.payload as any);
      const data = await response.json();

      // The scenario might say "expectedStatus": 400, 422, etc.
      // But JSONPlaceholder is too permissive. We'll just log the result:
      if (response.status() >= 400) {
        console.log("Got a 4xx or 5xx as AI predicted:", response.status());
      } else {
        console.warn(
          `Scenario expected ${scenario.expectedStatus}, but got ${response.status()}`
        );
      }

      console.log("Response body:", data);
      // If you wanted to forcibly fail unless we match scenario.expectedStatus, do:
      // expect(response.status()).toBe(scenario.expectedStatus);
    }
  });
});
