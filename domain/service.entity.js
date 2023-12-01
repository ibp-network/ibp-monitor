import { MembershipLevelEntity } from './membership-level.entity.js'

export class ServiceEntity {
  /** @type {String} */ id
  /** @type {String} */ chainId
  /** @type {'rpc' | 'bootnode'} */ type
  /** @type {Number} */ membershipLevelId
  /** @type {'active' | 'planned'} */ status
  /** @type {Date} */ createdAt
  /** @type {Date} */ updatedAt
  /** @type {MembershipLevelEntity?} */ membershipLevel

  /**
   * @param {ServiceEntity} initializator
   */
  constructor({
    id,
    chainId,
    type,
    membershipLevel,
    membershipLevelId,
    status,
    createdAt,
    updatedAt,
  }) {
    this.id = id
    this.chainId = chainId
    this.type = type
    this.membershipLevel = membershipLevel
    this.membershipLevelId = membershipLevelId
    this.status = status
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
