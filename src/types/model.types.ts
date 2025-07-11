// src/types/model.types.ts
export interface ModelParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'slider' | 'textarea';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[] | number[];
  min?: number;
  max?: number;
  step?: number;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  provider: string;
  parameters: ModelParameter[];
  inputType: 'text' | 'image' | 'audio' | 'json';
  outputType: 'text' | 'image' | 'audio' | 'json';
  examples: ModelExample[];
  apiEndpoint: string;
  documentation?: string;
}

export interface ModelExample {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  expectedOutput?: string;
}

export interface ModelExecutionRequest {
  modelId: string;
  parameters: Record<string, any>;
  input: any;
}

export interface ModelExecutionResponse {
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  metadata?: Record<string, any>;
}
