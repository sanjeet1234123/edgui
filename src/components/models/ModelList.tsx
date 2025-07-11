// src/components/models/ModelList.tsx
import React, { useState, useMemo } from 'react';
import { ModelConfig } from '../../types/model.types';
import { ModelCard } from './ModelCard';

interface ModelListProps {
  models: ModelConfig[];
  onModelSelect: (model: ModelConfig) => void;
}

export const ModelList: React.FC<ModelListProps> = ({ models, onModelSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(models.map(model => model.category))];
    return cats;
  }, [models]);

  const filteredModels = useMemo(() => {
    return models.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.provider.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || model.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [models, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">AI Model Playground</h1>
        <p className="text-gray-600 mt-2">
          Explore and test various AI models with dynamic parameter configurations
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredModels.length} of {models.length} models
        {selectedCategory !== 'All' && ` in ${selectedCategory}`}
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map(model => (
          <ModelCard
            key={model.id}
            model={model}
            onSelect={onModelSelect}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredModels.length === 0 && (
        <div className="text-center py-12">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No models found</h3>
          <p className="text-gray-600 mt-2">
            Try adjusting your search query or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};