import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// React Reflex styles
import 'react-reflex/styles.css'

// Mantine
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/charts/styles.css'
import '@mantine/code-highlight/styles.css'
import { MantineProvider } from '@mantine/core'
import {
  CodeHighlightAdapterProvider,
  createShikiAdapter,
} from '@mantine/code-highlight'
import { Notifications } from '@mantine/notifications'

import * as TanstackQuery from '@/integrations/tanstack-query/root-provider'

// Import the generated route tree
import { routeTree } from '@/routeTree.gen.ts'

import '@/styles.css'
import reportWebVitals from '@/reportWebVitals.ts'
import { mantineTheme } from '@/theme/mantineTheme.ts'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    ...TanstackQuery.getContext(),
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Shiki requires async code to load the highlighter
async function loadShiki() {
  const { createHighlighter } = await import('shiki')
  const shiki = await createHighlighter({
    langs: ['json'], // Only load essential languages
    themes: ['github-light', 'github-dark'], // Specify themes to avoid loading all
  })

  return shiki
}

const shikiAdapter = createShikiAdapter(loadShiki)

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanstackQuery.Provider>
        <MantineProvider theme={mantineTheme}>
          <CodeHighlightAdapterProvider adapter={shikiAdapter}>
            <Notifications position="top-right" />
            <RouterProvider router={router} />
          </CodeHighlightAdapterProvider>
        </MantineProvider>
      </TanstackQuery.Provider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
