import { useState } from 'react'
import { Stack } from '@mantine/core'
import ModalPlaygroundHeader from './ModalPlaygroundHeader'
import ModalPlaygroundChatCard from './ModalPlaygroundChatCard'
import ModalPlaygroundConfiguration from './ModalPlaygroundConfiguration'
import type { SliderValues } from '@/types/playgroundType'

function ModelPlayground() {
  const [sliderValues, setSliderValues] = useState<SliderValues>({
    temperature: 1,
    top_p: 1,
    top_k: 8,
    output_length: 2000,
  })

  return (
    <Stack className=" flex-grow">
      <ModalPlaygroundHeader />

      <div className="grid grid-cols-12 gap-4 flex-grow">
        <div className="col-span-12 lg:col-span-7 h-full">
          <ModalPlaygroundChatCard sliderValues={sliderValues} />
        </div>
        <div className="col-span-12 lg:col-span-5 h-full">
          <ModalPlaygroundConfiguration
            sliderValues={sliderValues}
            setSliderValues={setSliderValues}
          />
        </div>
      </div>
    </Stack>
  )
}

export default ModelPlayground
