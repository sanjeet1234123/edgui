// src/components/common/Navigation.tsx
import React from 'react';

interface NavigationProps {
  currentPage: 'models' | 'playground';
  onPageChange: (page: 'models' | 'playground') => void;
  selectedModel?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onPageChange, 
  selectedModel 
}) => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xl font-bold text-gray-900">AI Playground</span>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => onPageChange('models')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'models'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Models
              </button>
              
              <button
                onClick={() => onPageChange('playground')}
                disabled={!selectedModel}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'playground' && selectedModel
                    ? 'bg-blue-100 text-blue-700'
                    : selectedModel
                    ? 'text-gray-500 hover:text-gray-700'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                Playground
              </button>
            </div>
          </div>
          
          {selectedModel && (
            <div className="text-sm text-gray-600">
              Selected: <span className="font-medium">{selectedModel}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
