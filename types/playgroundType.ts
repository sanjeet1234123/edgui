export type SliderValues = {
  temperature: number
  top_p: number
  top_k: number
  output_length: number
}


export type Message = {
  role: string
  content: string
}

export type sendChatMessageRequest = {
  message: string
  model: string
  ingress_url: string
  temprature: number
  top_p: number
  max_length: number
}

export type ModelStatusRequest = {
  deployment_name: string
  hf_model_name: string
  ingress_model: string
}

export type ModelVulnerability = {
  id: number
  model_name: string
  vulnerability_type: string
  description: string
  severity: string
  impact: string
  mitigation: string
  status: string
  updated_at: string
  safety_status: string
  security_rating: number
}
