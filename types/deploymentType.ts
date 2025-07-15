export type NodeMetrics = {
  GPU: string
  CPU: string
  RAM: string
  Node: string
}

export type Cluster = {
  cluster_name: string
  provider_name: string
  onboarded_by: string
  environment: string
  clusterDataCards: {
    GPU: string
    CPU: string
    RAM: string
    Storage: string
    Node: string
  }
  node_metrics: Array<NodeMetrics>
  status: string
}

export type DeployClusterRequest = {
  hf_model_name: string
  cluster_name: string
}

export type DeploymentPodStatusRequest = {
  deployment_name: string
}

export interface DownscaleModelRequest extends DeploymentPodStatusRequest {}
