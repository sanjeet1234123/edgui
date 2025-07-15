import { Badge, Card, Group, Slider, Stack, Switch, Text } from '@mantine/core'
import { IconBolt } from '@tabler/icons-react'
import { useState } from 'react'
import ModalPlaygroundVulnerability from './ModalPlaygroundVulnerability'
import classes from './modalPlayground.module.css'
import { sliderConfigs } from './constant'
import type { SliderValues } from '@/types/playgroundType'

type ModalPlaygroundConfigurationProps = {
  sliderValues: SliderValues
  setSliderValues: (sliderValues: SliderValues) => void
}

function ModalPlaygroundConfiguration({
  sliderValues,
  setSliderValues,
}: ModalPlaygroundConfigurationProps) {
  const [isToggled, setIsToggled] = useState(false)

  const handleSliderChange = (stateKey: keyof SliderValues, value: number) => {
    setSliderValues({ ...sliderValues, [stateKey]: value })
  }

  return (
    <Card padding="xl" h="100%">
      <Stack gap="4rem" justify="space-between" h="100%">
        {/* Configurations */}
        <Stack gap="xl">
          {/* Toggle */}
          <Group justify="space-between">
            <Group gap="sm">
              <IconBolt
                size={22}
                color="var(--clr-model-playground-electric-icon)"
              />
              <Text>Auto-Set Max Length</Text>
            </Group>
            <Switch
              onChange={() => setIsToggled(!isToggled)}
              checked={isToggled} // Added checked prop for controlled component
              size="md"
              color="var(--clr-model-playground-switch)"
            />
          </Group>

          {/* Sliders */}
          <Stack gap="3rem">
            {sliderConfigs.map(config => (
              <Stack key={config.id} gap="xs">
                <Group justify="space-between">
                  <Text fw="600" size="var(--size-base)">
                    {config.label}
                  </Text>
                  <Badge
                    variant="light"
                    size="lg"
                    color="var(--clr-model-playground-slider)"
                    radius="md"
                    fw={config.id === 'temperature' ? 700 : undefined}
                  >
                    {/* Fixed to use type-safe access with proper spelling */}
                    {sliderValues[config.stateKey as keyof SliderValues]}
                  </Badge>
                </Group>
                <Slider
                  value={sliderValues[config.stateKey as keyof SliderValues]}
                  onChange={value =>
                    handleSliderChange(
                      config.stateKey as keyof SliderValues,
                      value,
                    )
                  }
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  marks={config.marks}
                  size="sm"
                  thumbSize={16}
                  label={null}
                  classNames={classes}
                />
              </Stack>
            ))}
          </Stack>
        </Stack>

        {/* Model Vulnerability */}
        <ModalPlaygroundVulnerability />
      </Stack>
    </Card>
  )
}

export default ModalPlaygroundConfiguration
