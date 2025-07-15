import { Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'
import ReflexButton from './reflexbutton'
import ServerPlaygroundHeader from './ServerPlaygroundHeader'
import ServerPlaygroundLists from './ServerPlaygroundLists'
import ServerPlaygroundServerDetails from './ServerPlaygroundServerDetails'
import ServerPlaygroundChatArea from './ServerPlaygroundChatArea'
import 'react-reflex/styles.css'

type ServerPlaygroundProps = {
  server: string
}

function ServerPlayground({ server }: ServerPlaygroundProps) {
  console.log('server', server)

  const [isLeftPanelCollapsed, { toggle: toggleLeftPanel }] =
    useDisclosure(false)
  const [isRightPanelCollapsed, { toggle: toggleRightPanel }] =
    useDisclosure(false)

  return (
    <Stack className="h-[calc(100vh-125px)] flex flex-col">
      <ServerPlaygroundHeader />

      {/* Reflex Container */}
      <div className="flex-1 min-h-0">
        <ReflexContainer
          orientation="vertical"
          windowResizeAware={true}
          className="h-full flex-1"
        >
          {/* Playground Lists */}
          <ReflexElement
            minSize={isLeftPanelCollapsed ? 0 : 300}
            flex={isLeftPanelCollapsed ? 0 : 0.24}
            maxSize={600}
            className="h-full overflow-auto"
          >
            <ServerPlaygroundLists server={server} />
          </ReflexElement>

          {/* Left Panel Splitter */}
          <ReflexSplitter style={{ position: 'relative' }}>
            <ReflexButton
              onClick={toggleLeftPanel}
              isCollapsed={isLeftPanelCollapsed}
              expandLabel="Show Lists"
              collapseLabel="Hide Lists"
            />
          </ReflexSplitter>

          {/* Playground Server Details */}
          <ReflexElement
            minSize={isRightPanelCollapsed ? 0 : 400}
            flex={isRightPanelCollapsed ? 0 : 0.37}
            maxSize={700}
            className="h-full overflow-auto"
          >
            <ServerPlaygroundServerDetails />
          </ReflexElement>

          {/* Right Panel Splitter */}
          <ReflexSplitter style={{ position: 'relative' }}>
            <ReflexButton
              onClick={toggleRightPanel}
              isCollapsed={isRightPanelCollapsed}
              expandLabel="Show Chat"
              collapseLabel="Hide Chat"
            />
          </ReflexSplitter>

          {/* Chat Area */}
          <ReflexElement minSize={400} className="h-full overflow-auto">
            <ServerPlaygroundChatArea />
          </ReflexElement>
        </ReflexContainer>
      </div>
    </Stack>
  )
}

export default ServerPlayground
