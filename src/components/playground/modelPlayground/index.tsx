import React, { useState } from 'react'
import { Stack } from '@mantine/core'
import ModalPlaygroundHeader from './ModalPlaygroundHeader'
import ModalPlaygroundChatCard from './ModalPlaygroundChatCard'
import ModalPlaygroundConfiguration from './ModalPlaygroundConfiguration'
import type { SliderValues } from '@/types/playgroundType'
import { useModelStore } from '@/store/modelStore'

function ModelPlayground() {
  const [sliderValues, setSliderValues] = useState<SliderValues>({
    temperature: 1,
    top_p: 1,
    top_k: 8,
    output_length: 2000,
  })
  const { modelSchema, currentModel } = useModelStore()

  if (!modelSchema || !currentModel) {
    return <div>No model schema found. Please select a model from the marketplace.</div>
  }

  // UI config
  const ui = modelSchema.ui || {}
  const layout = ui.layout || 'vertical'

  // Layout logic
  let gridContent
  if (layout === 'horizontal') {
    gridContent = (
      <div className="grid grid-cols-12 gap-4 flex-grow">
        <div className="col-span-5 h-full" style={ui.inputPanelStyle}>
          <h3 style={{ color: ui.primaryColor }}>{ui.icon} Input</h3>
          {modelSchema.inputSchema.map((field: any) => (
            <div key={field.name} style={{ marginBottom: 16 }}>
              <label>{field.label}</label>
              {field.type === 'textarea' && <textarea placeholder={field.placeholder} style={{ width: '100%' }} />}
              {field.type === 'number' && <input type="number" placeholder={field.placeholder} style={{ width: '100%' }} />}
              {field.type === 'file' && <input type="file" style={{ width: '100%' }} />}
              {field.type === 'text' && <input type="text" placeholder={field.placeholder} style={{ width: '100%' }} />}
              {field.type === 'select' && field.options && (
                <select style={{ width: '100%' }}>
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
        <div className="col-span-4 h-full" style={ui.outputPanelStyle}>
          <h3 style={{ color: ui.primaryColor }}>Output</h3>
          {modelSchema.outputSchema.map((field: any) => (
            <div key={field.name} style={{ marginBottom: 16 }}>
              <label>{field.label}</label>
              {field.type === 'textarea' && <textarea readOnly style={{ width: '100%' }} />}
              {field.type === 'number' && <input type="number" readOnly style={{ width: '100%' }} />}
              {field.type === 'text' && <input type="text" readOnly style={{ width: '100%' }} />}
            </div>
          ))}
        </div>
        <div className="col-span-3 h-full" style={ui.infoPanelStyle}>
          <h3 style={{ color: ui.primaryColor }}>Model Info</h3>
          <div><b>Name:</b> {currentModel.model_name}</div>
          <div><b>Description:</b> {modelSchema.metadata.description}</div>
          <div><b>Author:</b> {modelSchema.metadata.author}</div>
          <div><b>Version:</b> {modelSchema.metadata.version}</div>
          <div><b>Tags:</b> {modelSchema.metadata.tags.join(', ')}</div>
          <div><b>Ingress:</b> {modelSchema.ingress}</div>
        </div>
      </div>
    )
  } else {
    // vertical or split
    gridContent = (
      <div className="grid grid-cols-12 gap-4 flex-grow">
        <div className="col-span-12 lg:col-span-4 h-full" style={ui.inputPanelStyle}>
          <h3 style={{ color: ui.primaryColor }}>{ui.icon} Input</h3>
          {modelSchema.inputSchema.map(field => (
            <div key={field.name} style={{ marginBottom: 16 }}>
              <label>{field.label}</label>
              {field.type === 'textarea' && <textarea placeholder={field.placeholder} style={{ width: '100%' }} />}
              {field.type === 'number' && <input type="number" placeholder={field.placeholder} style={{ width: '100%' }} />}
              {field.type === 'file' && <input type="file" style={{ width: '100%' }} />}
              {field.type === 'text' && <input type="text" placeholder={field.placeholder} style={{ width: '100%' }} />}
              {field.type === 'select' && field.options && (
                <select style={{ width: '100%' }}>
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
        <div className="col-span-12 lg:col-span-5 h-full" style={ui.outputPanelStyle}>
          <h3 style={{ color: ui.primaryColor }}>Output</h3>
          {modelSchema.outputSchema.map(field => (
            <div key={field.name} style={{ marginBottom: 16 }}>
              <label>{field.label}</label>
              {field.type === 'textarea' && <textarea readOnly style={{ width: '100%' }} />}
              {field.type === 'number' && <input type="number" readOnly style={{ width: '100%' }} />}
              {field.type === 'text' && <input type="text" readOnly style={{ width: '100%' }} />}
            </div>
          ))}
        </div>
        <div className="col-span-12 lg:col-span-3 h-full" style={ui.infoPanelStyle}>
          <h3 style={{ color: ui.primaryColor }}>Model Info</h3>
          <div><b>Name:</b> {currentModel.model_name}</div>
          <div><b>Description:</b> {modelSchema.metadata.description}</div>
          <div><b>Author:</b> {modelSchema.metadata.author}</div>
          <div><b>Version:</b> {modelSchema.metadata.version}</div>
          <div><b>Tags:</b> {modelSchema.metadata.tags.join(', ')}</div>
          <div><b>Ingress:</b> {modelSchema.ingress}</div>
        </div>
      </div>
    )
  }

  return (
    <Stack className="flex-grow" style={{ minHeight: '100vh', background: ui.background }}>
      <ModalPlaygroundHeader />
      {gridContent}
    </Stack>
  )
}

export default ModelPlayground
