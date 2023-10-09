/**
 * Represents an entity that might (or not) be a member of the IBP network,
 * and that hosts nodes for the services provided by the network
 */
export class MemberEntity {
  /** @type {String} */ id
  /** @type {String} */ providerId
  /** @type {String} */ serviceIpAdress
  /** @type {String} */ monitorUrl

  /** @type {'hobbyist' | 'professional' | 'external'} */ membershipType
  /** @type {Number} */ membershipLevelId
  /** @type {Number} */ membershipLevelTimestamp
  /** @type {'active' | 'pending'} */ status

  constructor({
    id,
    serviceIpAddress,
    monitorUrl,
    membershipType,
    membershipLevelId,
    membershipLevelTimestamp,
    status,
  }) {
    this.id = id
    this.providerId = id
    this.serviceIpAddress = serviceIpAddress
    this.monitorUrl = monitorUrl
    this.membershipType = membershipType
    this.membershipLevelId = membershipLevelId
    this.membershipLevelTimestamp = membershipLevelTimestamp
    this.status = status
  }

  /**
   * Takes a config object as input (typically from a JSON file) and
   * turns it into a member entity
   * @param {Record<string, unknown>} configObject
   * @returns {MemberEntity}
   */
  static fromConfig(configObject) {
    const {
      id,
      services_address,
      monitor_url,
      current_level,
      membership,
      active,
      level_timestamp,
    } = configObject

    return new MemberEntity({
      id,
      serviceIpAddress: services_address,
      monitorUrl: monitor_url,
      membershipType: membership,
      membershipLevelId: Number(current_level) + 1,
      membershipLevelTimestamp: Number(level_timestamp[current_level]),
      status: !!Number(active) ? 'active' : 'pending',
    })
  }

  toRecord() {
    return this
  }
}
