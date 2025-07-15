import { useState } from 'react'
import ChatCardHeader from './chatCardData/ChatCardHeader'
import ChatCardBody from './chatCardData/ChatCardBody'
import ChatCardInput from './chatCardData/ChatCardInput'
import type { Message, SliderValues } from '@/types/playgroundType'
import { useModelStore } from '@/store/modelStore'
import { useSendChatMessageMutation } from '@/hooks/mutations/usePlaygroundMutations'

type ModalPlaygroundChatCardProps = {
  sliderValues: SliderValues
}

function ModalPlaygroundChatCard({
  sliderValues,
}: ModalPlaygroundChatCardProps) {
  const [messages, setMessages] = useState<Array<Message>>([])
  const [message, setMessage] = useState('')
  const [modelStatus, setModelStatus] = useState<boolean>(false)

  const currentModel = useModelStore((state) => state.currentModel)
  const ingressUrl = useModelStore((state) => state.ingressUrl)

  const modelName = currentModel?.model_name || ' '

  const { mutate, isPending, isError, error } = useSendChatMessageMutation()

  const handleSendMessage = () => {
    if (!message.trim()) return

    if (message.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: message },
      ])

      mutate({
        message: message.trim(),
        model: modelName,
        ingress_url: `${ingressUrl}/v1`,
        temprature: sliderValues.temperature,
        top_p: sliderValues.top_p,
        max_length: sliderValues.output_length,
      })
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && message.trim() && modelStatus) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <ChatCardHeader
        setModelStatus={setModelStatus}
        modelStatus={modelStatus}
      />
      <ChatCardBody
        messages={messages}
        isLoading={isPending}
        isError={isError}
        error={error}
      />
      <ChatCardInput
        message={message}
        setMessage={setMessage}
        handleKeyDown={handleKeyDown}
        handleSendMessage={handleSendMessage}
        isLoading={isPending}
        disabled={!modelStatus}
      />
    </div>
  )
}

export default ModalPlaygroundChatCard
