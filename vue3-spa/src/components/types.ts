
export interface IService {
  serviceUrl: string
  name: string
  memberId: string
  status: string
  errorCount: number
  monitors: [IMonitor]
  createdAt: any
  updatedAt: any
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
  serviceUrl: string
  monitorId: string
  source: string
  record: any
  createdAt: any
  updatedAt: any
}

export interface IMember {
  memberId: string
  name: string
  logo: string
  membership: string
  region: string
  current_level: any
  level_timestamp: any
  services: [IService]
  createdAt: any
  updatedAt: any
}

export interface IPeer {
  peerId: string
  createdAt: any
  updatedAt: any
}
