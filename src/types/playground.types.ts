export interface PlaygroundState {
  selectedModel: ModelConfig | null;
  parameters: Record<string, any>;
  input: any;
  output: ModelExecutionResponse | null;
  isExecuting: boolean;
  history: PlaygroundExecution[];
}

export interface PlaygroundExecution {
  id: string;
  timestamp: Date;
  modelId: string;
  parameters: Record<string, any>;
  input: any;
  output: ModelExecutionResponse;
}