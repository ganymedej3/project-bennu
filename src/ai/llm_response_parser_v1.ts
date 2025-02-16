/**
 * A dedicated helper for parsing LLM (Ollama) responses that may contain:
 * - triple backticks / code fences
 * - line-based // comments
 * - partial text outside the main JSON block
 * - either an array [ ... ] or object { ... }
 */

export interface LLMTopLevelResponse {
    model: string;
    response: string;
    done: boolean;
  }
  
  export class LLMResponseParser {
    /**
     * Remove triple backticks or code fences like ```json
     */
    static removeCodeFences(input: string): string {
      return input.replace(/```(\S+)?/g, "").trim();
    }
  
    /**
     * Strip line-based comments: // ...
     */
    static removeLineComments(input: string): string {
      // match anything from // to end of line
      return input.replace(/\/\/.*$/gm, "").trim();
    }
  
    /**
     * Find the first block that is either [ ... ] or { ... }
     * in a non-greedy way, ignoring text outside
     */
    static extractJsonBlock(input: string): string {
      // union capturing an array or object
      const match = input.match(/(\[[\s\S]*?\])|(\{[\s\S]*?\})/);
      return match ? match[0].trim() : "";
    }
  
    /**
     * Check if a string is valid JSON
     */
    static isValidJson(input: string): boolean {
      try {
        JSON.parse(input);
        return true;
      } catch {
        return false;
      }
    }
  
    /**
     * Full pipeline: parse the top-level JSON from Ollama, then
     * remove code fences, line comments, extract JSON block,
     * validate, and parse.
     *
     * Optionally, you can specify `expectedType = 'array' | 'object' | 'any'`
     * to do a final structural check.
     */
    static parseLLMResponse(
      raw: string,
      expectedType: "array" | "object" | "any" = "any"
    ): any {
      // Step A) parse the raw top-level JSON from Ollama
      // e.g. { "model": "...", "response": "...", "done": true }
      const top = JSON.parse(raw) as LLMTopLevelResponse;
      let cleaned = top.response || "";
  
      // Step B) remove code fences
      cleaned = this.removeCodeFences(cleaned);
  
      // Step C) remove line-based comments
      cleaned = this.removeLineComments(cleaned);
  
      // Step D) extract the first JSON block (array or object)
      let jsonBlock = this.extractJsonBlock(cleaned) || cleaned;
  
      // Step E) confirm valid JSON
      if (!this.isValidJson(jsonBlock)) {
        console.error("Invalid JSON after cleanup:\n", jsonBlock);
        throw new Error("LLM response is not valid JSON");
      }
  
      // Step F) parse
      const parsed = JSON.parse(jsonBlock);
  
      // Step G) optional type check
      if (expectedType === "array" && !Array.isArray(parsed)) {
        throw new Error("Expected an array from LLM, but got a non-array.");
      }
      if (expectedType === "object" && (Array.isArray(parsed) || typeof parsed !== "object")) {
        throw new Error("Expected an object from LLM, but got something else.");
      }
  
      return parsed;
    }
  }
  