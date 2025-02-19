import { AI_CONFIG } from "../config/ai.config";
import { LLMResponseParser } from "./llm_response_parser";

interface OllamaTopLevelResponse {
  model: string;
  response: string;
  done: boolean;
}

export class AIManager {
  /**
   * Low-level method: call Ollama with "stream": false => single JSON chunk
   */
  private static async callOllama(prompt: string): Promise<string> {
    const body = {
      prompt,
      model: AI_CONFIG.model.name,
      options: {
        num_ctx: 8192,
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
        `Ollama request failed [${response.status}]: ${errorText}`
      );
    }
    return await response.text(); // top-level JSON
  }

  /*
  private static parseDoubleJson(raw: string) {
    // 1) parse the top-level object from the LLM
    const top = JSON.parse(raw) as OllamaTopLevelResponse;
  
    // 2) retrieve the LLM's actual text
    let cleaned = top.response || "";
  
    // 2a) remove code fences (```json, etc.)
    cleaned = cleaned.replace(/```(\S+)?/g, "").trim();
  
    // 2b) remove line-based comments // ...
    cleaned = cleaned.replace(/\/\/.*$/gm, "").trim();
  
    // 3) extract the main JSON block
    // We'll union-match either an array [ ... ] or object { ... } in a non-greedy way
    const match = cleaned.match(/(\[[\s\S]*?\])|(\{[\s\S]*?\})/);
    let jsonBlock = match ? match[0].trim() : cleaned;
  
    // 4) check if valid JSON
    if (!this.isValidJson(jsonBlock)) {
      console.error("LLM text is not valid JSON after substring extraction:\n", jsonBlock);
      throw new Error("Invalid JSON from parseDoubleJson");
    }
  
    // 5) parse the final substring
    return JSON.parse(jsonBlock);
  }*/

    
/**
 * AI-based "fallback" locator generation if your beloved CSS or Xpath breaks.
 * Let the LLM rummage through the DOM (textually, anyway) to find you something new.
 */

  public static async fallbackLocatorAI(
    fullHtml: string,
    elementDesc: string
  ): Promise<string> {
    const template = AI_CONFIG.prompts.LOCATOR_FALLBACK_ANALYSIS.replace(
      "<<FULL_HTML>>",
      fullHtml
    ).replace("<<ELEMENT_DESC>>", elementDesc);

    const raw = await this.callOllama(template);

    try {
      // Now parseDoubleJson does the full cleaning + substring extraction
      const parsed = LLMResponseParser.parseLLMResponse(raw, "object");

      console.log(
        "Parsed from raw response: ",
        JSON.stringify(parsed, null, 2)
      );

      if (!parsed.selector) {
        throw new Error("No 'selector' field found in fallback AI");
      }
      return parsed.selector;
    } catch (err) {
      console.error("Error in fallbackLocatorAI parse:", raw);
      throw new Error("Invalid JSON from fallbackLocatorAI");
    }
  }

  public static async fallbackLocatorAIWithLocatorType(
    fullHtml: string,
    elementDesc: string,
    locatorType: string
  ): Promise<string> {
    const template = AI_CONFIG.prompts.LOCATOR_FALLBACK_ANALYSIS_2.replace(
      "<<FULL_HTML>>",
      fullHtml
    )
      .replace("<<ELEMENT_DESC>>", elementDesc)
      .replace("<<TARGET_LOCATOR_TYPE>>", locatorType);

    const raw = await this.callOllama(template);
    //console.log("\n"+"Raw response from llm: "+ raw);
    try {
      //const parsed = this.parseDoubleJson(raw);
      const parsed = LLMResponseParser.parseLLMResponse(raw, "object");
      console.log(
        "Parsed from raw response: ",
        JSON.stringify(parsed, null, 2)
      );

      if (!parsed.selector) {
        throw new Error("No 'selector' field found in fallback AI");
      }
      return parsed.selector;
    } catch (err) {
      console.error("Error in fallbackLocatorAI parse:", raw);
      throw new Error("Invalid JSON from fallbackLocatorAI");
    }
  }

  /**
   * #2 Compare existing page-object locators to new HTML, returning which changed
   */
  public static async compareLocatorsAI(
    fullHtml: string,
    oldLocators: Record<string, string>
  ): Promise<{
    unchanged: Record<string, string>;
    changed: Record<string, { old: string; new: string }>;
  }> {
    const oldLocatorsJson = JSON.stringify(oldLocators, null, 2);
    const template = AI_CONFIG.prompts.LOCATOR_MAINTENANCE_COMPARE.replace(
      "<<OLD_LOCATORS_JSON>>",
      oldLocatorsJson
    ).replace("<<FULL_HTML>>", fullHtml);

    const raw = await this.callOllama(template);
    try {
      //const parsed = this.parseDoubleJson(raw);
      const parsed = LLMResponseParser.parseLLMResponse(raw, "object");
      return {
        unchanged: parsed.unchanged || {},
        changed: parsed.changed || {},
      };
    } catch (err) {
      console.error("Error in compareLocatorsAI parse:", raw);
      throw new Error("Invalid JSON from compareLocatorsAI");
    }
  }

  // ----------------------------------------------------------------
  // SELECTOR GENERATION (Multi-Step)
  // ----------------------------------------------------------------

  public static async generateSelectorV2(
    description: string,
    structureSummary: string
  ): Promise<string> {
    const prompt = AI_CONFIG.prompts.SELECTOR_GENERATION_V2.replace(
      "<DESCRIPTION>",
      description
    ).replace("<SUMMARY>", structureSummary);

    const raw = await this.callOllama(prompt);
    try {
      // parse expecting an object
      const parsed = LLMResponseParser.parseLLMResponse(raw, "object");
      if (!parsed.selector) {
        throw new Error("No 'selector' field found");
      }
      return parsed.selector;
    } catch (err) {
      console.error("Error parsing SELECTOR_GENERATION_V2 output:", raw);
      throw new Error("Invalid JSON from SELECTOR_GENERATION_V2");
    }
  }

  // ----------------------------------------------------------------
  // MULTI-STEP PAGE / DOM ANALYSIS
  // ----------------------------------------------------------------

  public static async analyzePageChunk(
    htmlChunk: string
  ): Promise<{ summary: string; remainingContext: string }> {
    const promptTemplate = AI_CONFIG.prompts.PAGE_STRUCTURE_ANALYSIS;
    const prompt = promptTemplate.replace(
      "The user will provide a chunk of HTML.",
      `The user chunk:\n${htmlChunk}`
    );

    const raw = await this.callOllama(prompt);
    try {
      const parsed = LLMResponseParser.parseLLMResponse(raw, "object");
      // e.g. { summary: "short summary", remainingContext: "..." }
      return {
        summary: parsed.summary || "",
        remainingContext: parsed.remainingContext || "",
      };
    } catch (error) {
      console.error("Error parsing PAGE_STRUCTURE_ANALYSIS output:", raw);
      throw new Error("Invalid JSON from PAGE_STRUCTURE_ANALYSIS");
    }
  }

  public static async analyzeLargePage(
    fullHtml: string,
    chunkSize = AI_CONFIG.model.parameters.chunkSize
  ): Promise<string> {
    let remaining = fullHtml;
    let globalSummary = "";

    while (remaining.length > 0) {
      const chunk = remaining.slice(0, chunkSize);
      remaining = remaining.slice(chunkSize);

      const { summary, remainingContext } = await this.analyzePageChunk(chunk);
      globalSummary += " " + summary;
      if (remainingContext) globalSummary += " " + remainingContext;
    }

    return globalSummary.trim();
  }

  public static async multiStepSelectorGeneration(
    fullHtml: string,
    description: string
  ): Promise<string> {
    const summary = await this.analyzeLargePage(fullHtml);
    return this.generateSelectorV2(description, summary);
  }

  // For multi-element queries
  public static async generateMultiElementSelectorsV2(
    description: string,
    structureSummary: string
  ): Promise<string[]> {
    const multiPrompt = `
You are an AI that finds ALL elements that match a given description in a summarized DOM.

Description: "<DESCRIPTION>"
Summarized DOM: "<SUMMARY>"

Output valid JSON only:
{
  "selectors": ["selector_for_element_1", "selector_for_element_2", ...]
}
    `
      .replace("<DESCRIPTION>", description)
      .replace("<SUMMARY>", structureSummary);

    const raw = await this.callOllama(multiPrompt);
    try {
      // parse expecting an object with a `selectors` array
      const parsed = LLMResponseParser.parseLLMResponse(raw, "object");
      if (!parsed.selectors || !Array.isArray(parsed.selectors)) {
        throw new Error("No 'selectors' array found");
      }
      return parsed.selectors;
    } catch (err) {
      console.error("Error parsing multi-element generation:", raw);
      throw new Error("Invalid JSON from multi-element generation");
    }
  }

  public static async multiStepFindElements(
    fullHtml: string,
    description: string
  ): Promise<string[]> {
    const summary = await this.analyzeLargePage(fullHtml);
    return this.generateMultiElementSelectorsV2(description, summary);
  }

  /**
   * Clean up the LLM's response by removing any triple backtick fences (```...```)
   * or code fences like ```json
   */
  private static removeCodeFences(input: string): string {
    // This regex will remove any ``` plus optional language after it, e.g. ```json
    // and also remove trailing ```
    return input.replace(/```(\S+)?/g, "").trim();
  }

  /**
   * Check if a string is valid JSON
   */
  private static isValidJson(input: string): boolean {
    try {
      JSON.parse(input);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Identify up to "maxElements" key elements from the full HTML for UI test automation.
   * Returns { "elements": [ { "element_description": "...", "selectors": { ... } }, ... ] }
   */
  public static async identifyKeyElements(
    fullHtml: string,
    maxElements: number = 20
  ) {
    const promptTemplate = AI_CONFIG.prompts.KEY_ELEMENT_IDENTIFICATION.replace(
      "<<FULL_HTML>>",
      fullHtml
    ).replace("<<MAX_ELEMENTS>>", `${maxElements}`);

    const raw = await this.callOllama(promptTemplate);

    try {
      // parse expecting an object with an `elements` array
      const parsed = LLMResponseParser.parseLLMResponse(raw, "object");

      if (!parsed.elements || !Array.isArray(parsed.elements)) {
        throw new Error("No 'elements' array found in identifyKeyElements response");
      }
      return parsed;
    } catch (err) {
      console.error("Error parsing KEY_ELEMENT_IDENTIFICATION output:", raw);
      throw new Error("Invalid JSON from KEY_ELEMENT_IDENTIFICATION");
    }

    /*
    try {
      // 1) parse the top-level Ollama response
      const topLevel = JSON.parse(raw) as OllamaTopLevelResponse;

      //****all of this stuff was needed because llms can be unpredictable and sometimes return pos junk.
      //HOPE (yes hope) larger models are better at following the prompts

      // 2) remove triple backtick fences (```...) from topLevel.response
      let cleaned = this.removeCodeFences(topLevel.response);

      // 2a) also remove line-based comments. This addresses lines like:
      //     "data-test": "some selector" // comment
      cleaned = cleaned.replace(/\/\/.*$/gm, "").trim();

      // 3) extract only the first big JSON block (either { ... } or [ ... ])
      //    from the string
      const match = cleaned.match(/(\[[\s\S]*?\])|(\{[\s\S]*?\})/);
      if (!match) {
        console.error(
          "No JSON object/array found after removing code fences:\n",
          cleaned
        );
        throw new Error("Invalid JSON from KEY_ELEMENT_IDENTIFICATION");
      }

      // the substring from the first '{' to the last '}'
      let jsonBlock = match[0].trim();

      // 4) confirm it's valid JSON
      if (!this.isValidJson(jsonBlock)) {
        console.error(
          "LLM response is not valid JSON even after substring extraction:\n",
          jsonBlock
        );
        throw new Error("Invalid JSON from KEY_ELEMENT_IDENTIFICATION");
      }

      // 5) parse the final cleaned substring
      const parsed = JSON.parse(jsonBlock);

      // 6) validate the structure
      if (!parsed.elements || !Array.isArray(parsed.elements)) {
        throw new Error(
          "No 'elements' array found in identifyKeyElements response"
        );
      }
      return parsed;
    } catch (err) {
      console.error("Error parsing KEY_ELEMENT_IDENTIFICATION output:", raw);
      throw new Error("Invalid JSON from KEY_ELEMENT_IDENTIFICATION");
    }*/
  }
}
