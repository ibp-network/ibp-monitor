// polyfill for CustomEvent
export interface CustomEvent<T = any> extends Event {
  /** Returns any custom data event was created with. Typically used for synthetic events. */
  readonly detail: T;
  /** @deprecated */
  initCustomEvent(
    type: string,
    bubbles?: boolean,
    cancelable?: boolean,
    detail?: T,
  ): void;
}

// https://github.com/ChainSafe/js-libp2p-gossipsub/blob/324c69356fa928244f571af20d673c6d8e1ba2d2/src/message/rpc.d.ts#L150
/** Properties of a Message. */
export interface Message {
  /** Message from */
  from?: Uint8Array | null;
  /** Message data */
  data?: Uint8Array | null;
  /** Message seqno */
  seqno?: Uint8Array | null;
  /** Message topic */
  topic: string;
  /** Message signature */
  signature?: Uint8Array | null;
  /** Message key */
  key?: Uint8Array | null;
}
