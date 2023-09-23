export class ServiceEntity {
  /** @type {String} */ id
  /** @type {String} */ chainId
  /** @type {'rpc' | 'bootnode'} */ type
  /** @type {Number} */ membershipLevelId
  /** @type {'active' | 'planned'} */ status
  /** @type {Date} */ createdAt
  /** @type {Date} */ updatedAt

  constructor({ id, chainId, type, membershipLevelId, status, createdAt, updatedAt }) {
    this.id = id
    this.chainId = chainId
    this.type = type
    this.membershipLevelId = membershipLevelId
    this.status = status
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
