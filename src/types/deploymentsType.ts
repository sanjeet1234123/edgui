export type Deployment = {
  id: number
  hf_model_name: string
  user_email: string
  workspace_id: string
  deployed_at: string
  ingress: string
  release_name: string
  cluster_name: string
  node_name: string
  api_key: string
  environment: string
  project_id: number
  observability_url: string
  logs_url: string
  governance_url: string
  deployment_name: string
  ingress_sub_url: string
}

export type Deployments = Array<Deployment>

export type DeploymentResponse = {
  deployment: Deployments
}

export type DeploymentsCardType = {
  id: number
  model_name: string
  mode_icon: string
  deployed_by: string
  Created_at: string
  cluster: string
  endpoint_url: string
  token_usage: number
  token_usage_percentage: number
  status: string
  observability_url: string
  logs_url: string
  governance_url: string
  data: Array<number>
}
