import { createFileRoute, Link } from '@tanstack/react-router'
import { models } from '../../models/models'

export const Route = createFileRoute('/playground/')({
  component: PlaygroundList,
})

function PlaygroundList() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose a Model Playground</h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {models.map(model => (
          <div key={model.id} className="rounded-lg shadow-md border p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="text-xl font-bold mb-2">{model.name}</div>
              <div className="text-gray-600 mb-4">{model.description}</div>
            </div>
            <Link
              to={`/playground/${model.id}`}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center font-semibold"
            >
              Open Playground
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
} 