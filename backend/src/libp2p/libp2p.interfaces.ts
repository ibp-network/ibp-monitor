// interfaces

export interface IP2pAddresses {
  listen: string[];
  announce: string[];
}

export interface ILibp2pOptions {
  // peerId?: any;
  // dateTimeFormat: string; // 'DD/MM/YYYY HH:mm',
  // sequelize: ISequelizeOptions;
  // redis: IRedisOptions; // {
  // httpPort: number; // HTTP_PORT,
  tcpPort: string | number; // GOSSIP_PORT,
  // wsPort?: number; // WS_PORT,
  // apiPort: number; // API_PORT,
  addresses?: IP2pAddresses;
  allowedTopics: string[]; // | Set<string>;
  // updateInterval: number; // 5 * 60 * 1000, // 5 mins, as milliseconds
  bootstrapPeers: string[];
  gossipResults: boolean; // true,
  // relay: null,
  // pruning: IPruningOptions;
}

// {"pattern":{"command":"pubsub.peers"},"data":{},"id":"aaf48d96d87acf635fab3"}
export interface Libp2pRpcRequest {
  id?: string;
  // method: string;
  // params: Record<string, unknown>;
  pattern: MessagePattern;
  data?: Record<string, unknown>;
}

export interface MessagePattern {
  command: string;
  data?: any;
}

export interface Libp2pRpcResponse {
  id?: string;
  // method: string;
  // response: any;
  pattern: MessagePattern;
  data: Record<string, unknown>;
  err?: any;
}
