import React, { useState, useEffect } from 'react';
import { ModelConfig, ModelExecutionResponse } from '../../types/model.types';
import { ParameterInput } from './ParameterInput';
import { ModelOutput } from './ModelOutput';
import { modelService } from '../../services/modelService';

interface ModelPlaygroundProps {
  model: ModelConfig;
}

export const ModelPlayground: React.FC<ModelPlaygroundProps> = ({ model }) => {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<ModelExecutionResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedExample, setSelectedExample] = useState<string>('');
  const [parameterErrors, setParameterErrors] = useState<Record<string, string>>({});

  // Initialize parameters with default values
  useEffect(() => {
    const defaultParams: Record<string, any> = {};
    model.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        defaultParams[param.id] = param.defaultValue;
      }
    });
    setParameters(defaultParams);
  }, [model]);

  const handleParameterChange = (paramId: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramId]: value
    }));
    
    // Clear error for this parameter
    if (parameterErrors[paramId]) {
      setParameterErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[paramId];
        return newErrors;
      });
    }
  };

  const loadExample = (exampleId: string) => {
    const example = model.examples.find(ex => ex.id === exampleId);
    if (example) {
      setParameters(example.parameters);
      setSelectedExample(exampleId);
      
      // Set example input if available
      if (example.expectedOutput) {
        setInput(example.expectedOutput);
      }
    }
  };

  const validateParameters = (): boolean => {
    const errors: Record<string, string> = {};
    
    model.parameters.forEach(param => {
      if (param.required && !parameters[param.id]) {
        errors[param.id] = `${param.name} is required`;
      }
    });

    setParameterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const executeModel = async () => {
    if (!validateParameters()) {
      return;
    }

    if (!input.trim()) {
      alert('Please provide input for the model');
      return;
    }

    setIsExecuting(true);
    setOutput(null);

    try {
      const response = await modelService.executeModel({
        modelId: model.id,
        parameters,
        input: input.trim()
      });
      
      setOutput(response);
    } catch (error) {
      setOutput({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const resetPlayground = () => {
    setParameters({});
    setInput('');
    setOutput(null);
    setSelectedExample('');
    setParameterErrors({});
    
    // Reset to default values
    const defaultParams: Record<string, any> = {};
    model.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        defaultParams[param.id] = param.defaultValue;
      }
    });
    setParameters(defaultParams);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{model.name}</h1>
            <p className="text-gray-600 mt-1">{model.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {model.category}
              </span>
              <span className="text-sm text-gray-500">
                Provider: {model.provider}
              </span>
              <span className="text-sm text-gray-500">
                Version: {model.version}
              </span>
            </div>
          </div>
          <button
            onClick={resetPlayground}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Parameters</h2>
            
            {/* Examples */}
            {model.examples.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Load Example
                </label>
                <select
                  value={selectedExample}
                  onChange={(e) => loadExample(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an example...</option>
                  {model.examples.map(example => (
                    <option key={example.id} value={example.id}>
                      {example.name}
                    </option>
                  ))}
                </select>
                {selectedExample && (
                  <p className="text-sm text-gray-600 mt-1">
                    {model.examples.find(ex => ex.id === selectedExample)?.description}
                  </p>
                )}
              </div>
            )}

            {/* Parameter Inputs */}
            <div className="space-y-4">
              {model.parameters.map(parameter => (
                <ParameterInput
                  key={parameter.id}
                  parameter={parameter}
                  value={parameters[parameter.id]}
                  onChange={(value) => handleParameterChange(parameter.id, value)}
                  error={parameterErrors[parameter.id]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Input and Output Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Input</h2>
            <div className="space-y-4">
              {model.inputType === 'text' && (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Enter ${model.inputType} input for ${model.name}...`}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                />
              )}
              
              {model.inputType === 'json' && (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical font-mono"
                />
              )}

              <div className="flex items-center space-x-4">
                <button
                  onClick={executeModel}
                  disabled={isExecuting || !input.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isExecuting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Execute Model</span>
                    </>
                  )}
                </button>
                
                <div className="text-sm text-gray-500">
                  Input Type: {model.inputType} → Output Type: {model.outputType}
                </div>
              </div>
            </div>
          </div>

          {/* Output Section */}
          {output && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Output</h2>
              <ModelOutput output={output} outputType={model.outputType} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};