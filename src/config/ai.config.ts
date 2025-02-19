export interface AIConfig {
  api: {
    baseUrl: string;
    endpoints: {
      generate: string;
      //embeddings: string;
    };
  };
  model: {
    name: string;
    parameters: {
      //temperature: number;
      //maxTokens: number;
      //topP: number;
      //frequencyPenalty: number;
      //presencePenalty: number;
      chunkSize: number;
      promptTimeout: number;
    };
  };
  prompts: {
    API_DATA_GENERATION: string;
    API_NEGATIVE_SCENARIOS: string;
    KEY_ELEMENT_IDENTIFICATION: string;
    LOCATOR_FALLBACK_ANALYSIS: string;
    LOCATOR_FALLBACK_ANALYSIS_2: string;
    LOCATOR_MAINTENANCE_COMPARE: string;
    PAGE_STRUCTURE_ANALYSIS: string;
    SELECTOR_GENERATION_V2: string; 
  };

  retry: {
    attempts: number;
    backoff: {
      initial: number;
      multiplier: number;
      maxDelay: number;
    };
  };
  // ...
}

export const AI_CONFIG: AIConfig = {
  api: {
    baseUrl: "http://localhost:11434",
    endpoints: {
      generate: "/api/generate"
      //embeddings: "/api/embeddings",
    },
  },
  model: {
    name: "mistral:7b-instruct",
    parameters: {
      chunkSize: 6000,
      promptTimeout: 60000
    },
  },
  prompts: {

    API_DATA_GENERATION: `
You are an AI that generates test data for a given API resource or endpoint.
Given:
- The endpoint name or resource type: "<<RESOURCE_NAME>>"
- The number of items to generate: <<COUNT>>

IMPORTANT INSTRUCTIONS for your output:
1) Output ONLY valid JSON. No markdown code fences or triple backticks.
2) No line-based comments like "// ...".
3) Do NOT add any text after the JSON. No explanations or extra commentary.
4) Return strictly one JSON array with <<COUNT>> items. For example:
[
  { "field1": "value", "field2": 123 },
  { "field1": "another", "field2": 456 }
]

Any extraneous text or explanation will break the parser. 
IMPORTANT: Double-check that your JSON is valid. No trailing commas, no code fences, no line comments. No text after the final bracket.
`,

API_NEGATIVE_SCENARIOS: `
You are an AI that enumerates negative or invalid scenarios for an API endpoint.
Given:
- Endpoint name or short summary: "<<ENDPOINT_DESCRIPTION>>"
- The number of scenarios to generate: <<COUNT>>

Return a JSON array of <<COUNT>> scenario objects. Each should describe:
{
  "description": "short explanation of the invalid scenario",
  "payload": {...}, 
  "expectedStatus": 4xx or 5xx,
  "reason": "why it fails or is invalid"
}
(IMPORTANT: produce valid JSON, no code fences or extra text).
(Important: use double quotes for all JSON fields, no single quotes!)
(Important: Do NOT wrap the output in any markdown code fences or triple backticks. Just return plain valid JSON.)
(Important: Only output ONE JSON block. Do NOT append extra braces or code fences. No additional text after the final '}'.)

Double-check your output is strictly valid JSON. End after the final bracket, no extra lines.
`,
    KEY_ELEMENT_IDENTIFICATION: `
You are an AI that analyzes a webpage's HTML to find the top N key elements for UI test automation. 
Given:
- The full HTML of the page: <<FULL_HTML>>
- The number of elements to return: <<MAX_ELEMENTS>>

You should:
1) Identify up to <<MAX_ELEMENTS>> elements that are most relevant for someone writing automated tests. 
   (e.g. main containers, forms, buttons, dropdowns, anything likely to be tested).
2) For each element, provide:
   - "element_description": a friendly name or short description
   - "selectors": {
       "id": "... or null",
       "class": "... or null",
       "css": "... or null (the best single css if you can guess one)",
       "data-test": "... or null"
     }
3) If any attribute is missing, use null.
4) Return ONLY valid JSON with the structure:
{
  "elements": [
    {
      "element_description": "...",
      "selectors": {
        "id": "... or null",
        "class": "... or null",
        "css": "... or null",
        "data-test": "... or null"
      }
    },
    ...
  ]
}
(Important: use double quotes for all JSON fields, no single quotes!)
(Important: Do NOT wrap the output in any markdown code fences or triple backticks. Just return plain valid JSON.)
(Important: Only output ONE JSON block. Do NOT append extra braces or code fences. No additional text after the final '}'.)

Double-check your output is strictly valid JSON. End after the final bracket, no extra lines.

`,
    LOCATOR_FALLBACK_ANALYSIS: `
You are an AI that helps fix broken locators in an HTML page. 
We provide the FULL HTML, plus a textual description of the element we want. 
Generate a robust css selector we can use, in valid JSON.

**Important:** Your output must only contain a JSON object with a "selector" field. Do not include any additional fields or metadata (such as "context", "total_duration", etc.).

HTML: <<FULL_HTML>>
Element description: "<<ELEMENT_DESC>>"

Return JSON:
{
  "selector": "... valid CSS selector ..."
}
(Important: use double quotes for all JSON fields.)
`,

LOCATOR_FALLBACK_ANALYSIS_2: `
You are an AI that fixes broken locators in HTML pages. We provide the FULL HTML content, a clear textual description of the target element, and the specific target locator type that we need (for example, "css", "data-test", or "xpath").

Your task is to generate an exact locator for the described element that uniquely identifies it, using the specified target locator type. 

**Important:** Your output must only contain a JSON object with a single "selector" field. Do not include any additional fields or metadata.

HTML: <<FULL_HTML>>
Element description: "<<ELEMENT_DESC>>"
Target Locator Type: "<<TARGET_LOCATOR_TYPE>>"

Return JSON:
{
  "selector": "... valid locator string ..."
}

(Use double quotes for all JSON fields.)
`,

    LOCATOR_MAINTENANCE_COMPARE: `
You are an AI that compares a dictionary of old locators to the new HTML. 
Identify which locators still match, which are broken, and propose new ones for the broken items.
**Important:** Do not include any additional fields or metadata (such as "context", "total_duration", etc.).

Output valid JSON like:
{
  "unchanged": {
    "locatorName": "css selector"
  },
  "changed": {
    "locatorName": {
      "old": "old css",
      "new": "updated css"
    }
  }
}

Old locators (JSON):
<<OLD_LOCATORS_JSON>>

NEW HTML:
<<FULL_HTML>>
`,
    // ...
  },
  // ...
  retry: {
    attempts: 3,
    backoff: {
      initial: 1000,
      multiplier: 1.5,
      maxDelay: 10000,
    },
  },
};
