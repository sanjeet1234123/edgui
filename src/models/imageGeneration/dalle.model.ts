export const dalleModel: ModelConfig = {
  id: 'dalle-3',
  name: 'DALL-E 3',
  description: 'OpenAI\'s DALL-E 3 model for image generation',
  category: 'Image Generation',
  version: '1.0.0',
  provider: 'OpenAI',
  inputType: 'text',
  outputType: 'image',
  apiEndpoint: '/api/models/dalle-3/execute',
  parameters: [
    {
      id: 'size',
      name: 'Image Size',
      type: 'select',
      description: 'Size of the generated image',
      required: true,
      defaultValue: '1024x1024',
      options: ['1024x1024', '1792x1024', '1024x1792']
    },
    {
      id: 'quality',
      name: 'Quality',
      type: 'select',
      description: 'Image quality level',
      required: false,
      defaultValue: 'standard',
      options: ['standard', 'hd']
    },
    {
      id: 'style',
      name: 'Style',
      type: 'select',
      description: 'Style of the generated image',
      required: false,
      defaultValue: 'vivid',
      options: ['vivid', 'natural']
    }
  ],
  examples: [
    {
      id: 'landscape',
      name: 'Landscape',
      description: 'Generate a natural landscape',
      parameters: {
        size: '1792x1024',
        quality: 'hd',
        style: 'natural'
      }
    },
    {
      id: 'portrait',
      name: 'Portrait',
      description: 'Generate a vivid portrait',
      parameters: {
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid'
      }
    }
  ]
};