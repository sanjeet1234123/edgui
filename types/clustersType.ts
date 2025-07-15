export type Cluster = {
  id: number
  cluster_name: string
  workspace: string
  cloud_type: string
  framework: string
  user_name: string
  user_email: string
  frame_status: null
  created_at: number
  updated_at: number
  environment: string
  project_id: string
  gpu: string
  storage: string
  cpu: string
  ram: string
  nodes: string
  active_models: null
  gpu_utilization: string
  cpu_utilization: string
  is_suffiecient_resource: boolean
  node_metrics: Array<NodeMetrics> | null
  total_cpu_allocatable: string
  total_cpu_used: string
  total_cpu_utilization: string
  ingress: string
  ingress_class: string
  observability_url: string
  logs_url: string
  governance_url: string
}

type NodeMetrics = {
  id: number
  infra_integration_id: number
  node_name: string
  internal_ip: string
  cpu_allocatable: string
  cpu_used: string
  cpu_utilization: number
  memory_allocatable: string
  memory_used: string
  memory_utilization: number
  gpu_allocatable: string
  gpu_used: string
  gpu_utilization: number
  gpu_model: string
  cpu_model: string
  created_at: string
  updated_at: string
}

export type Clusters = Array<Cluster> | null

export type ClusterResponse = {
  suitable_clusters: Clusters
}

export type ClusterCardData = {
  id: number
  cluster_name: string
  provider_name: string
  onboarded_by: string
  environment: string
  node_metrics: Array<NodeMetricsData>
  gpu_utilization: number
  cpu_utilization: number
  observability_url: string
}

type NodeMetricsData = {
  GPU: string
  CPU: string
  RAM: string
  Node: string
}
