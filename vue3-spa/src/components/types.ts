export interface IEndpoint {
  memberId: string
  serviceId: string
  serviceUrl: string
  name: string
  chain: string
  errorCount: number
  status: string
  createdAt: any
  updatedAt: any
}

export interface IService {
  id: string
  name: string
  endpoint: string
  level_required: number
  parachain: boolean
  parentId: string
  status: string
  logo: string
}

export interface IMonitor {
  monitorId: string
  services: [IService]
  addresses: any[]
  createdAt: any
  updatedAt: any
}

export interface IHealthCheck {
  id: number
  level: string
  serviceId: string
  memberId: string
  monitorId: string
  source: string
  record: any
  createdAt: any
  updatedAt: any
}

export interface IMember {
  id: string
  name: string
  logo: string
  membership: string
  region: string
  current_level: any
  level_timestamp: any
  // services: [IService]
  endpoints: [IEndpoint]
  createdAt: any
  updatedAt: any
}

export interface IPeer {
  peerId: string
  createdAt: any
  updatedAt: any
}
