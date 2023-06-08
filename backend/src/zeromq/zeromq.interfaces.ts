export interface Libp2pRpcRequest {
  method: string;
  params?: any;
}

export interface Libp2pRpcResponse {
  method: string;
  result: any;
  error?: any;
}
