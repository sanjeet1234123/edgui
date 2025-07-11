// src/services/modelService.ts
import { ModelConfig, ModelExecutionRequest, ModelExecutionResponse } from '../types/model.types';
import { modelRegistry } from '../utils/modelRegistry';

export class ModelService {
  async executeModel(request: ModelExecutionRequest): Promise<ModelExecutionResponse> {
    const startTime = Date.now();
    
    try {
      const model = modelRegistry.getModel(request.modelId);
      if (!model) {
        throw new Error(`Model ${request.modelId} not found`);
      }

      // Validate parameters
      this.validateParameters(model, request.parameters);

      // Make API call to model endpoint
      const response = await fetch(model.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parameters: request.parameters,
          input: request.input
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        result,
        executionTime,
        metadata: {
          modelId: request.modelId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime
      };
    }
  }

  private validateParameters(model: ModelConfig, parameters: Record<string, any>): void {
    for (const param of model.parameters) {
      if (param.required && !(param.id in parameters)) {
        throw new Error(`Required parameter ${param.name} is missing`);
      }

      const value = parameters[param.id];
      if (value !== undefined) {
        this.validateParameterValue(param, value);
      }
    }
  }

  private validateParameterValue(param: any, value: any): void {
    switch (param.type) {
      case 'number':
        if (typeof value !== 'number') {
          throw new Error(`Parameter ${param.name} must be a number`);
        }
        if (param.min !== undefined && value < param.min) {
          throw new Error(`Parameter ${param.name} must be >= ${param.min}`);
        }
        if (param.max !== undefined && value > param.max) {
          throw new Error(`Parameter ${param.name} must be <= ${param.max}`);
        }
        break;
      case 'string':
      case 'textarea':
        if (typeof value !== 'string') {
          throw new Error(`Parameter ${param.name} must be a string`);
        }
        if (param.validation?.minLength && value.length < param.validation.minLength) {
          throw new Error(`Parameter ${param.name} must be at least ${param.validation.minLength} characters`);
        }
        if (param.validation?.maxLength && value.length > param.validation.maxLength) {
          throw new Error(`Parameter ${param.name} must be no more than ${param.validation.maxLength} characters`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error(`Parameter ${param.name} must be a boolean`);
        }
        break;
      case 'select':
        if (param.options && !param.options.includes(value)) {
          throw new Error(`Parameter ${param.name} must be one of: ${param.options.join(', ')}`);
        }
        break;
    }
  }
}

export const modelService = new ModelService();