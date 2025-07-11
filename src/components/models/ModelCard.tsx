// src/components/models/ModelCard.tsx
import React from 'react';
import { ModelConfig } from '../../types/model.types';

interface ModelCardProps {
  model: ModelConfig;
  onSelect: (model: ModelConfig) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model, onSelect }) => {
  const getInputTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        );
      case 'json':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(model)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {model.category}
            </span>
          </div>
          <p className="text-gray-600 mt-1">{model.description}</p>
          
          <div className="flex items-center space-x-4 mt-3">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              {getInputTypeIcon(model.inputType)}
              <span>{model.inputType}</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              {getInputTypeIcon(model.outputType)}
              <span>{model.outputType}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Provider: {model.provider}</span>
              <span>•</span>
              <span>v{model.version}</span>
            </div>
            <div className="text-sm text-gray-500">
              {model.parameters.length} parameters
            </div>
          </div>
        </div>
        
        <div className="ml-4">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};