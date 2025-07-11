import React from 'react';
import { ModelParameter } from '../../types/model.types';

interface ParameterInputProps {
  parameter: ModelParameter;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const ParameterInput: React.FC<ParameterInputProps> = ({
  parameter,
  value,
  onChange,
  error
}) => {
  const renderInput = () => {
    switch (parameter.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={parameter.defaultValue}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={parameter.defaultValue}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            min={parameter.min}
            max={parameter.max}
            step={parameter.step}
            placeholder={parameter.defaultValue?.toString()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{parameter.min}</span>
              <span className="font-medium">{value || parameter.defaultValue}</span>
              <span>{parameter.max}</span>
            </div>
            <input
              type="range"
              min={parameter.min}
              max={parameter.max}
              step={parameter.step}
              value={value || parameter.defaultValue}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value || parameter.defaultValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {parameter.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <label className="block text-sm font-medium text-gray-700">
          {parameter.name}
          {parameter.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {parameter.description && (
          <div className="group relative">
            <svg 
              className="w-4 h-4 text-gray-400 cursor-help" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {parameter.description}
            </div>
          </div>
        )}
      </div>
      
      {renderInput()}
      
      {error && (
        <div className="text-sm text-red-600 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};