import { ModelConfig } from '../types/model.types';

class ModelRegistry {
  private models: Map<string, ModelConfig> = new Map();
  private categories: Set<string> = new Set();

  register(model: ModelConfig): void {
    this.models.set(model.id, model);
    this.categories.add(model.category);
  }

  getModel(id: string): ModelConfig | undefined {
    return this.models.get(id);
  }

  getAllModels(): ModelConfig[] {
    return Array.from(this.models.values());
  }

  getModelsByCategory(category: string): ModelConfig[] {
    return this.getAllModels().filter(model => model.category === category);
  }

  getCategories(): string[] {
    return Array.from(this.categories);
  }

  searchModels(query: string): ModelConfig[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllModels().filter(model => 
      model.name.toLowerCase().includes(lowerQuery) ||
      model.description.toLowerCase().includes(lowerQuery) ||
      model.category.toLowerCase().includes(lowerQuery)
    );
  }
}

export const modelRegistry = new ModelRegistry();