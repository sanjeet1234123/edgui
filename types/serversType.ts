export interface Server {
  id: number
  name: string
  description: string
  namespace: string
  last_updated: string
  by: string
  characteristics: ServerCharacteristics
  tools: Array<ServerTool>
  mcp_config: MCPConfig
}

export interface MCPConfig {
  mcpServers: {
    [key: string]: ServerConfig
  }
}

export interface ServerConfig {
  args: Array<string>
  command: string
  env?: {
    [key: string]: string | number | boolean | null | undefined
  }
}

export interface ServerCharacteristics {
  image_source: string
  docker_image: string
  author: string
  repository: string
  dockerfile: string
  docker_image_built_by: string
  docker_scout_health_score: string
  license: string
}

export interface ServerTool {
  tool: string
  description: string
  parameters: Array<{
    name: string
    type: string
    description: string
    optional: boolean
  }>
}

export interface ServerResponse {
  data: Array<Server> | null
  limit: number
  page: number
  total: number
}
