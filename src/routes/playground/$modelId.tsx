import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { models } from '../../models/models'
import type { ModelMeta } from '../../models/models'

export const Route = createFileRoute('/playground/$modelId')({
  component: Playground,
})

function getHardcodedSchema(modelId: string) {
  if (modelId === 'echo') {
    return {
      type: 'message',
      content: 'Type something to echo:',
      actions: [
        { type: 'input', id: 'echo_input', placeholder: 'Type here...' },
        { type: 'button', label: 'Echo', action: 'echo_submit' }
      ]
    }
  }
  if (modelId === 'reverse') {
    return {
      type: 'message',
      content: 'Type something to reverse:',
      actions: [
        { type: 'input', id: 'reverse_input', placeholder: 'Type here...' },
        { type: 'button', label: 'Reverse', action: 'reverse_submit' }
      ]
    }
  }
  if (modelId === 'repeat') {
    return {
      type: 'message',
      content: 'Type a message and how many times to repeat:',
      actions: [
        { type: 'input', id: 'repeat_message', placeholder: 'Message...' },
        { type: 'input', id: 'repeat_count', placeholder: 'Count...' },
        { type: 'button', label: 'Repeat', action: 'repeat_submit' }
      ]
    }
  }
  return null;
}

function AGUIPlayground({ agui, modelId, onEvent }: { agui: any, modelId: string, onEvent: (event: any) => void }) {
  const [values, setValues] = useState<Record<string, any>>({})

  function handleInput(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  function handleButton(action: string) {
    onEvent({ action, values })
  }

  if (!agui) return null

  // Unique UI per model
  let color = 'bg-blue-50', icon = '💬';
  if (modelId === 'reverse') { color = 'bg-purple-50'; icon = '🔄'; }
  if (modelId === 'repeat') { color = 'bg-green-50'; icon = '🔁'; }

  return (
    <div className={`p-6 rounded-lg shadow-md border ${color}`}>
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-2">{icon}</span>
        <span className="text-xl font-bold">{agui.content}</span>
      </div>
      {agui.actions?.map((a: any) => {
        if (a.type === 'input') {
          return (
            <input
              key={a.id}
              className="border p-2 rounded w-full mb-2"
              placeholder={a.placeholder}
              value={values[a.id] || ''}
              onChange={e => handleInput(a.id, e.target.value)}
            />
          )
        }
        if (a.type === 'button') {
          return (
            <button
              key={a.action}
              className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
              onClick={() => handleButton(a.action)}
            >
              {a.label}
            </button>
          )
        }
        return null
      })}
    </div>
  )
}

function Playground() {
  const { modelId } = useParams('/playground/$modelId')
  const navigate = useNavigate()
  const model = models.find(m => m.id === modelId)
  const [output, setOutput] = useState('')
  const aguiSchema = getHardcodedSchema(modelId)

  function handleAGUIEvent(event: any) {
    if (modelId === 'echo' && event.action === 'echo_submit') {
      setOutput(event.values.echo_input)
    } else if (modelId === 'reverse' && event.action === 'reverse_submit') {
      setOutput((event.values.reverse_input || '').split('').reverse().join(''))
    } else if (modelId === 'repeat' && event.action === 'repeat_submit') {
      setOutput(Array(Number(event.values.repeat_count)).fill(event.values.repeat_message).join(' '))
    } else {
      setOutput('Action handled: ' + JSON.stringify(event))
    }
  }

  if (!model) {
    return <div className="text-center text-red-600">Model not found. <button className="underline" onClick={() => navigate('/playground')}>Back</button></div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <button className="text-blue-600 underline" onClick={() => navigate('/playground')}>← Back to models</button>
      </div>
      <h1 className="text-3xl font-bold mb-2 text-center">{model.name} Playground</h1>
      <div className="text-center text-gray-600 mb-6">{model.description}</div>
      <AGUIPlayground agui={aguiSchema} modelId={modelId} onEvent={handleAGUIEvent} />
      {output && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-center">
          <span className="font-semibold text-green-700">Output:</span> {output}
        </div>
      )}
    </div>
  )
} 