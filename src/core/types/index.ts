// Test Result Types
export interface TestResult {
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: Error;
  screenshot?: string;
}

// Common HTTP Types
export interface APIResponse<T = any> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

// AI-Enhanced Test Types
export interface AITestContext {
  featureEnabled: boolean;
  modelName: string;
  lastPrediction?: string;
  confidence?: number;
}

// UI Element Types
export interface ElementInfo {
  selector: string;
  text?: string;
  visible: boolean;
  enabled: boolean;
  attributes?: Record<string, string>;
}

// Test Metadata Types
export interface TestMetadata {
  title: string;
  category: "ui" | "api";
  tags: string[];
  priority: "low" | "medium" | "high";
  aiAssisted: boolean;
}

// Retry Configuration
export interface RetryConfig {
  attempts: number;
  backoff: {
    initial: number;
    multiplier: number;
    maxDelay: number;
  };
}

//for the AI enhanced investory page class
export interface ElementInfo {
  selector: string;
  visible: boolean;
  text?: string;
  attributes?: Record<string, string>;
}
//for the AI enhanced investory page class
export interface ElementSearchResult {
  elements: ElementInfo[];
  count: number;
}

// Error Types
export class TestError extends Error {
  type: "validation" | "network" | "timeout" | "assertion";
  context?: Record<string, any>;

  constructor({
    name,
    message,
    type,
    context,
  }: {
    name: string;
    message: string;
    type: "validation" | "network" | "timeout" | "assertion";
    context?: Record<string, any>;
  }) {
    super(message);
    this.name = name;
    this.type = type;
    this.context = context;
  }
}
