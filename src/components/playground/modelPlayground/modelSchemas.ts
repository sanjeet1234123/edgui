export type ModelSchema = {
  ingress: string;
  metadata: {
    description: string;
    author: string;
    version: string;
    tags: string[];
  };
  inputSchema: Array<{
    name: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
  outputSchema: Array<{
    name: string;
    type: string;
    label: string;
  }>;
  ui?: {
    primaryColor?: string;
    background?: string;
    icon?: string; // emoji or icon name
    layout?: 'vertical' | 'horizontal' | 'split';
    inputPanelStyle?: React.CSSProperties;
    outputPanelStyle?: React.CSSProperties;
    infoPanelStyle?: React.CSSProperties;
  };
};

export const modelSchemas: Record<string, ModelSchema> = {
  "TextGen-1": {
    ingress: "https://textgen-1.demo/ingress",
    metadata: {
      description: "A simple text generation model.",
      author: "Demo Author",
      version: "1.0.0",
      tags: ["text", "generation", "demo"],
    },
    inputSchema: [
      { name: "prompt", type: "textarea", label: "Prompt", placeholder: "Enter your prompt...", required: true },
      { name: "temperature", type: "number", label: "Temperature", placeholder: "0.7", required: false },
    ],
    outputSchema: [
      { name: "output", type: "textarea", label: "Generated Text" },
    ],
    ui: {
      primaryColor: '#4F8EF7',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)',
      icon: '📝',
      layout: 'vertical',
      inputPanelStyle: { background: '#f8fafc', borderRadius: 12, padding: 16 },
      outputPanelStyle: { background: '#e0e7ff', borderRadius: 12, padding: 16 },
      infoPanelStyle: { background: '#f0f4ff', borderRadius: 12, padding: 16 },
    },
  },
  "ImageClassify-2": {
    ingress: "https://imageclassify-2.demo/ingress",
    metadata: {
      description: "Image classification model for demo images.",
      author: "Demo Author",
      version: "2.1.0",
      tags: ["image", "classification", "demo"],
    },
    inputSchema: [
      { name: "image", type: "file", label: "Upload Image", required: true },
    ],
    outputSchema: [
      { name: "label", type: "text", label: "Predicted Label" },
      { name: "confidence", type: "number", label: "Confidence Score" },
    ],
    ui: {
      primaryColor: '#F76F4F',
      background: 'linear-gradient(135deg, #fff0e0 0%, #ffe7e0 100%)',
      icon: '🖼️',
      layout: 'horizontal',
      inputPanelStyle: { background: '#fff7f0', borderRadius: 12, padding: 16 },
      outputPanelStyle: { background: '#ffe7e0', borderRadius: 12, padding: 16 },
      infoPanelStyle: { background: '#fff0e0', borderRadius: 12, padding: 16 },
    },
  },
}; 