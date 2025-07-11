// src/models/analysis/sentiment.model.ts
export const sentimentModel: ModelConfig = {
  id: 'sentiment-analysis',
  name: 'Sentiment Analysis',
  description: 'Analyze the sentiment of text input',
  category: 'Text Analysis',
  version: '1.0.0',
  provider: 'Custom',
  inputType: 'text',
  outputType: 'json',
  apiEndpoint: '/api/models/sentiment-analysis/execute',
  parameters: [
    {
      id: 'model_type',
      name: 'Model Type',
      type: 'select',
      description: 'Type of sentiment analysis model',
      required: true,
      defaultValue: 'bert',
      options: ['bert', 'roberta', 'distilbert']
    },
    {
      id: 'confidence_threshold',
      name: 'Confidence Threshold',
      type: 'slider',
      description: 'Minimum confidence score for predictions',
      required: false,
      defaultValue: 0.8,
      min: 0.5,
      max: 1.0,
      step: 0.05
    },
    {
      id: 'return_probabilities',
      name: 'Return Probabilities',
      type: 'boolean',
      description: 'Include probability scores in output',
      required: false,
      defaultValue: true
    }
  ],
  examples: [
    {
      id: 'positive-review',
      name: 'Positive Review',
      description: 'Analyze a positive product review',
      parameters: {
        model_type: 'bert',
        confidence_threshold: 0.8,
        return_probabilities: true
      }
    },
    {
      id: 'social-media',
      name: 'Social Media Post',
      description: 'Analyze sentiment of social media content',
      parameters: {
        model_type: 'roberta',
        confidence_threshold: 0.7,
        return_probabilities: true
      }
    }
  ]
};
