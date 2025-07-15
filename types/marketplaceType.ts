export interface Model {
  model_id: number
  docker_image: string
  image_tag: string
  model_name: string
  trending: boolean
  provider: string
  provider_base64_image: string
  hf_model_name: string
  cpu_limit: string
  cpu_request: string
  memory_limit: string
  memory_request: string
  gpu_limit: string
  gpu_request: string
  model_type: string
  release_name: string
  deployment_name: string
  deployment_sub_name: string
  description: string
  value_yaml_file: string
  environment: string
  project_id: string
  processor: string
  processor_type: string
  cores: string
  gpu_vram: string
  ram: string
  storage: string
  nodes: string
  cluster_type: string
  updated_at: string
  vulnerability: string
  ranking: number
  created_by: number
  status: string
}

export type ModelResponse = {
  models: Array<Model>
}

export type UpscaleModelRequest = {
  deployment_name: string
}

export type UpscaleModelResponse = {
  ingress_url: string
}

export type LoadModelForm = {
  addUrlInput: string
  addDescriptionInput: string
  addTokenInput: string
}

export type LoadModelRequest = {
  url: string
  description: string
  trending: boolean
  token?: string
}
