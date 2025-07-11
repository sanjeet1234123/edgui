import React from 'react';
import { ModelExecutionResponse } from '../../types/model.types';

interface ModelOutputProps {
  output: ModelExecutionResponse;
  outputType: 'text' | 'image' | 'audio' | 'json';
}

export const ModelOutput: React.FC<ModelOutputProps> = ({ output, outputType }) => {
  const formatJson = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!output.success) {
    return (
      <div className="space-y-4">
        {/* Error Display */}
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-medium text-red-800">Execution Failed</h3>
          </div>
          <div className="mt-2 text-sm text-red-700">
            {output.error}
          </div>
        </div>

        {/* Execution Info */}
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Execution Time:</span> {output.executionTime}ms
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-medium text-green-800">Execution Successful</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {output.executionTime}ms
          </span>
          
          {outputType === 'text' || outputType === 'json' ? (
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(
                  outputType === 'json' ? formatJson(output.result) : output.result
                )}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Copy
              </button>
              <button
                onClick={() => downloadContent(
                  outputType === 'json' ? formatJson(output.result) : output.result,
                  `output.${outputType === 'json' ? 'json' : 'txt'}`
                )}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Download
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Output Content */}
      <div className="border rounded-md">
        {outputType === 'text' && (
          <div className="p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
              {output.result}
            </pre>
          </div>
        )}

        {outputType === 'json' && (
          <div className="p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-900 font-mono">
              {formatJson(output.result)}
            </pre>
          </div>
        )}

        {outputType === 'image' && (
          <div className="p-4 flex justify-center">
            {typeof output.result === 'string' ? (
              <img 
                src={output.result} 
                alt="Generated output" 
                className="max-w-full max-h-96 rounded-md shadow-sm"
              />
            ) : output.result?.url ? (
              <img 
                src={output.result.url} 
                alt="Generated output" 
                className="max-w-full max-h-96 rounded-md shadow-sm"
              />
            ) : (
              <div className="text-center text-gray-500">
                <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Image could not be displayed</p>
              </div>
            )}
          </div>
        )}

        {outputType === 'audio' && (
          <div className="p-4">
            {typeof output.result === 'string' ? (
              <audio controls className="w-full">
                <source src={output.result} type="audio/mpeg" />
                <source src={output.result} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            ) : output.result?.url ? (
              <audio controls className="w-full">
                <source src={output.result.url} type="audio/mpeg" />
                <source src={output.result.url} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className="text-center text-gray-500">
                <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <p>Audio could not be played</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metadata */}
      {output.metadata && (
        <div className="bg-gray-50 rounded-md p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Metadata</h4>
          <pre className="text-xs text-gray-600 font-mono">
            {formatJson(output.metadata)}
          </pre>
        </div>
      )}
    </div>
  );
};