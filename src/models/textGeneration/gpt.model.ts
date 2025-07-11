import { ModelConfig } from '../../types/model.types';

export const gptModel: ModelConfig = {
  id: 'gpt-3.5-turbo',
  name: 'GPT-3.5 Turbo',
  description: 'OpenAI\'s GPT-3.5 Turbo model for text generation and conversation',
  category: 'Text Generation',
  version: '1.0.0',
  provider: 'OpenAI',
  inputType: 'text',
  outputType: 'text',
  apiEndpoint: '/api/models/gpt-3.5-turbo/execute',
  parameters: [
    {
      id: 'temperature',
      name: 'Temperature',
      type: 'slider',
      description: 'Controls randomness in the output. Higher values make output more random.',
      required: false,
      defaultValue: 0.7,
      min: 0,
      max: 2,
      step: 0.1
    },
    {
      id: 'max_tokens',
      name: 'Max Tokens',
      type: 'number',
      description: 'Maximum number of tokens to generate',
      required: false,
      defaultValue: 150,
      min: 1,
      max: 4000
    },
    {
      id: 'top_p',
      name: 'Top P',
      type: 'slider',
      description: 'Controls diversity via nucleus sampling',
      required: false,
      defaultValue: 1.0,
      min: 0,
      max: 1,
      step: 0.1
    },
    {
      id: 'frequency_penalty',
      name: 'Frequency Penalty',
      type: 'slider',
      description: 'Reduces repetition of tokens',
      required: false,
      defaultValue: 0,
      min: -2,
      max: 2,
      step: 0.1
    },
    {
      id: 'presence_penalty',
      name: 'Presence Penalty',
      type: 'slider',
      description: 'Increases likelihood of talking about new topics',
      required: false,
      defaultValue: 0,
      min: -2,
      max: 2,
      step: 0.1
    }
  ],
  examples: [
    {
      id: 'creative-writing',
      name: 'Creative Writing',
      description: 'Generate creative content with higher temperature',
      parameters: {
        temperature: 1.2,
        max_tokens: 200,
        top_p: 0.9
      }
    },
    {
      id: 'factual-qa',
      name: 'Factual Q&A',
      description: 'Answer factual questions with lower temperature',
      parameters: {
        temperature: 0.2,
        max_tokens: 100,
        top_p: 0.8
      }
    }
  ]
};