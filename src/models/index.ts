import { modelRegistry } from '../utils/modelRegistry';
import { gptModel } from './textGeneration/gpt.model';
import { dalleModel } from './imageGeneration/dalle.model';
import { sentimentModel } from './analysis/sentiment.model';

// Register all models
export function initializeModels() {
  modelRegistry.register(gptModel);
  modelRegistry.register(dalleModel);
  modelRegistry.register(sentimentModel);
}

export { modelRegistry };