export interface LLMTopLevelResponse {
  model: string;
  response: string;
  done: boolean;
}

/**
 * This parser tries to handle many "junk" patterns from the LLM:
 * - code fences or triple backticks
 * - line-based // comments
 * - partial text beyond the main JSON block
 * - bracket balancing for { ... } or [ ... ]
 * - invalid escapes like \_ or \* that break JSON
 */
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
   * Extract the main JSON block by balancing brackets—like carefully disarming a bomb
   * with half-baked instructions from an AI. Because life is an adventure.
   */

  //yes - this code was written by another LLM

  static extractBalancedJsonBlock(input: string): string {
    let trimmed = input.trim();
    if (!trimmed) return "";

    const firstChar = trimmed[0];
    let open = "";
    let close = "";

    if (firstChar === "{") {
      open = "{";
      close = "}";
    } else if (firstChar === "[") {
      open = "[";
      close = "]";
    } else {
      // text doesn't start with { or [, so we can't do bracket-balancing
      return "";
    }

    let level = 0;
    let endIndex = -1;

    for (let i = 0; i < trimmed.length; i++) {
      const c = trimmed[i];
      if (c === open) {
        level++;
      } else if (c === close) {
        level--;
        if (level === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex === -1) {
      // never found matching bracket
      return "";
    }

    // substring from 0 to endIndex inclusive
    return trimmed.slice(0, endIndex + 1);
  }

  /**
   * Remove unrecognized escape sequences from a JSON string:
   * e.g. \_ or \*, which are not valid in JSON.
   *
   * We keep the recognized escapes: \" \\ \/ \b \f \n \r \t
   * We remove the slash if it doesn't match one of those combos.
   */
  static removeInvalidEscapes(input: string): string {
    // Regex approach: match backslash not followed by "\/bfnrt
    // (?!...) is negative lookahead, meaning if it's not one of the recognized
    return input.replace(/\\(?!["\\/bfnrt])/g, "");
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
   * Full pipeline:
   *  A) parse top-level JSON from Ollama => { model, response, done }
   *  B) remove code fences, line comments, unrecognized escapes
   *  C) bracket-balance to find the main block
   *  D) parse final result, optionally check `expectedType`
   */
  static parseLLMResponse(
    raw: string,
    expectedType: "array" | "object" | "any" = "any"
  ): any {
    // Step A) parse top-level
    const top = JSON.parse(raw) as LLMTopLevelResponse;
    let cleaned = top.response || "";

    // Step B1) remove code fences
    cleaned = this.removeCodeFences(cleaned);
    // Step B2) remove line-based comments
    cleaned = this.removeLineComments(cleaned);
    // Step B3) remove unrecognized escapes
    cleaned = this.removeInvalidEscapes(cleaned);

    // Step C) bracket balance
    let jsonBlock = this.extractBalancedJsonBlock(cleaned);
    if (!jsonBlock) {
      // fallback to entire cleaned if we can't bracket-balance
      jsonBlock = cleaned;
    }

    // Step D1) remove invalid escapes from the substring too
    jsonBlock = this.removeInvalidEscapes(jsonBlock);

    // Step D2) validate + parse
    if (!this.isValidJson(jsonBlock)) {
      console.error("Invalid JSON after cleanup:\n", jsonBlock);
      throw new Error("LLM response is not valid JSON");
    }
    const parsed = JSON.parse(jsonBlock);

    // Step E) optional type check
    if (expectedType === "array" && !Array.isArray(parsed)) {
      throw new Error("Expected an array from LLM, but got a non-array.");
    }
    if (
      expectedType === "object" &&
      (Array.isArray(parsed) || typeof parsed !== "object")
    ) {
      throw new Error("Expected an object from LLM, but got something else.");
    }

    return parsed;
  }
}
