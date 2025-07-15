export type OnPremClusterConfiguration = {
  clusterName: string
  ingress: string
  ingressClass: string
}

export type AddClusterRequest = {
  cluster_name: string
  cloud_type: string
  framework: string
  ingress: string
  ingress_class: string
  file: File
}

export type ManagedNexastackClusterConfiguration = {
  clusterName: string
}

export type ManagedClusterRequest = {
  cluster_name: string
  ingress: string
}

export type AssignPermissionsFormValues = {
  awsARN: string
  region: string
}

export type AssignPermissionsRequest = {
  region: string
  user_id: number
  user_resource_arn: string
}

export type RegisterClusterRequest = {
  cluster_name: string
  user_id: number
  account_id: string
}

export type GCPClusterConfiguration = {
  clusterName: string
}

export type GetAWSInstancesResponse = {
  account_id: string
  clusters: Array<string>
}

export type GCPOnboardRequest = {
  credentials_file: File
  cluster_name: string
}
