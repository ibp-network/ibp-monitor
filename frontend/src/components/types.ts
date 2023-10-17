export interface IChain {
  id: string
  genesisHash: string
  name: string
  relayChainId: string
  logoUrl: string
}

export interface IMembershipLevel {
  id: number
  name: string
  subdomain: string
}

export interface IService {
  id: string
  chain: IChain
  type: string
  membershipLevel: IMembershipLevel
  status: string
}

export interface IMember {
  id: string
  name: string
  websiteUrl: string
  logoUrl: string
  serviceIpAddress: string
  membershipType: string
  membershipLevelId: number
  membershipLevelTimestamp: number
  status: string
  region: string
  services: [IMemberService]
  createdAt: number
  updatedAt: number
}

export interface IMemberService {
  id: string
  memberId: string
  serviceId: string
  serviceUrl: string
  status: string
  createdAt: number
  updatedAt: number
}

export interface IMemberServiceNode {
  peerId: string
  serviceId: string
  memberId: string
  createdAt: number
  updatedAt: number
}

export interface IMonitor {
  id: string
  addresses: string[]
  status: string
  createdAt: number
  updatedAt: number
}

export interface IHealthCheck {
  id: number
  monitorId: string
  serviceId: string
  providerId: string
  memberId?: string
  peerId: string
  source: string
  status: string
  record: any
  createdAt: number
}

export interface IGeoDnsPool {
  id: string
  name: string
  host: string
  createdAt: number
}
