import { AI_CONFIG } from "../config/ai.config";
import { LLMResponseParser } from "./llm_response_parser";

interface ApiAiResponse {
  model: string;
  response: string;
  done: boolean;
}

// Our new manager specifically for API-related LLM calls
export class ApiAIManager {
  /**
   * 1) Low-level call to local AI (Ollama or other).
   * We keep it local so we don't affect UI manager code.
   */
  private static async callLocalLLM(prompt: string): Promise<string> {
    const body = {
      prompt,
      model: AI_CONFIG.model.name,
      options: {
        // remove or pass only recognized params
      },
      stream: false,
    };

    const url = AI_CONFIG.api.baseUrl + AI_CONFIG.api.endpoints.generate;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Local LLM request failed [${response.status}]: ${errorText}`
      );
    }

    return await response.text();
  }

  /*
  private static removeCodeFences(input: string): string {
    return input.replace(/```(\S+)?/g, "").trim();
  }

  private static removeLineComments(input: string): string {
    // `gm` => multi-line; match '//' plus the rest of the line
    return input.replace(/\/\/.*$/gm, "").trim();
  }

  private static extractJsonBlock(input: string): string {
    // first remove line-based comments
    input = this.removeLineComments(input);

    // union regex to find either [ ... ] or { ... }, non-greedy
    const match = input.match(/(\[[\s\S]*?\])|(\{[\s\S]*?\})/);
    return match ? match[0].trim() : "";
  }

  private static isValidJson(input: string): boolean {
    try {
      JSON.parse(input);
      return true;
    } catch {
      return false;
    }
  }
  */

  /**
   * Generate test data for an API resource.
   * e.g. `resourceName = "user"`, `count = 5` => returns array of 5 objects
   */
  public static async generateTestDataForApi(resourceName: string, count = 3) {
    const prompt = AI_CONFIG.prompts.API_DATA_GENERATION.replace(
      "<<RESOURCE_NAME>>",
      resourceName
    ).replace("<<COUNT>>", String(count));

    const raw = await this.callLocalLLM(prompt);

    try {
      // parse expecting an array of objects
      const parsed = LLMResponseParser.parseLLMResponse(raw, "array");
      // e.g. [ {...}, {...} ]
      return parsed;
    } catch (err) {
      console.error("Error parsing API_DATA_GENERATION output:", raw);
      throw new Error("Invalid JSON from API_DATA_GENERATION");
    }

    /*
    try {
      const topLevel = JSON.parse(raw) as ApiAiResponse;
      // 1) remove code fences
      let cleaned = this.removeCodeFences(topLevel.response);

      // 2) extract main JSON block (array or object). If not found, fallback to entire cleaned
      const jsonBlock = this.extractJsonBlock(cleaned) || cleaned;

      // 3) validate parse
      if (!this.isValidJson(jsonBlock)) {
        console.error("LLM test data is not valid JSON:\n", jsonBlock);
        throw new Error("Invalid JSON from API_DATA_GENERATION");
      }
      const parsed = JSON.parse(jsonBlock);

      // 4) we expect an array for test data
      if (!Array.isArray(parsed)) {
        throw new Error("API_DATA_GENERATION should return an array of objects.");
      }
      return parsed; // e.g. array of objects
    } catch (err) {
      console.error("Error parsing API_DATA_GENERATION output:", raw);
      throw new Error("Invalid JSON from API_DATA_GENERATION");
    }*/
  }

/**
 * Ask the LLM to conjure up the wildest (and hopefully valid) negative scenarios
 * for our unsuspecting JSONPlaceholder endpoint. The AI might get creative—brace yourself.
 */
  public static async generateNegativeScenarios(
    endpointDescription: string,
    count = 3
  ) {
    const prompt = AI_CONFIG.prompts.API_NEGATIVE_SCENARIOS.replace(
      "<<ENDPOINT_DESCRIPTION>>",
      endpointDescription
    ).replace("<<COUNT>>", String(count));

    const raw = await this.callLocalLLM(prompt);

    try {
        // parse expecting an array
        const parsed = LLMResponseParser.parseLLMResponse(raw, "array");
        // e.g. [ {description, payload, expectedStatus, reason}, { ... } ]
        return parsed;
      } catch (err) {
        console.error("Error parsing API_NEGATIVE_SCENARIOS output:", raw);
        throw new Error("Invalid JSON from API_NEGATIVE_SCENARIOS");
      }
    /*
    try {
      const topLevel = JSON.parse(raw) as ApiAiResponse;
      // 1) remove code fences
      let cleaned = this.removeCodeFences(topLevel.response);

      // 2) extract main JSON block
      const jsonBlock = this.extractJsonBlock(cleaned) || cleaned;

      // 3) validate parse
      if (!this.isValidJson(jsonBlock)) {
        console.error(
          "LLM negative scenarios are not valid JSON:\n",
          jsonBlock
        );
        throw new Error("Invalid JSON from API_NEGATIVE_SCENARIOS");
      }
      const parsed = JSON.parse(jsonBlock);

      // 4) we expect an array of scenario objects
      if (!Array.isArray(parsed)) {
        throw new Error(
          "API_NEGATIVE_SCENARIOS should return an array of scenario objects."
        );
      }
      return parsed; // e.g. array of { description, payload, expectedStatus, reason }
    } catch (err) {
      console.error("Error parsing API_NEGATIVE_SCENARIOS output:", raw);
      throw new Error("Invalid JSON from API_NEGATIVE_SCENARIOS");
    }*/
  }
}
