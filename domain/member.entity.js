/**
 * Represents an entity that might (or not) be a member of the IBP network,
 * and that hosts nodes for the services provided by the network
 */
export class MemberEntity {
  /** @type {String} */ id
  /** @type {String} */ name
  /** @type {String} */ websiteUrl
  /** @type {String} */ logoUrl
  /** @type {String} */ serviceIpAdress
  /** @type {String} */ monitorUrl

  /** @type {'hobbyist' | 'professional' | 'external'} */ membershipType
  /** @type {Number} */ membershipLevelId
  /** @type {Number} */ membershipLevelTimestamp
  /** @type {'active' | 'pending'} */ status

  /** @type {'' | 'africa' | 'asia' | 'central_america' | 'europe' | 'middle_east' | 'north_america' | 'oceania'} */
  region

  /** @type {Number} */ latitude
  /** @type {Number} */ longitude

  constructor({
    id,
    name,
    websiteUrl,
    logoUrl,
    serviceIpAddress,
    monitorUrl,
    membershipType,
    membershipLevelId,
    membershipLevelTimestamp,
    status,
    region,
    latitude,
    longitude,
  }) {
    this.id = id
    this.name = name
    this.websiteUrl = websiteUrl
    this.logoUrl = logoUrl
    this.serviceIpAddress = serviceIpAddress
    this.monitorUrl = monitorUrl
    this.membershipType = membershipType
    this.membershipLevelId = membershipLevelId
    this.membershipLevelTimestamp = membershipLevelTimestamp
    this.status = status
    this.region = region
    this.latitude = latitude
    this.longitude = longitude
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
      name = configObject.id,
      website = null,
      logo = null,
      membership = 'external',
      current_level = '0',
      active = '0',
      level_timestamp = { 0: `${Date.now() / 1_000}` },
      services_address = '0.0.0.0',
      monitor_url = null,
      region = '',
      latitude = '0.0000',
      longitude = '0.0000',
    } = configObject

    return new MemberEntity({
      id,
      name,
      websiteUrl: website,
      logoUrl: logo,
      serviceIpAddress: services_address,
      monitorUrl: monitor_url,
      membershipType: membership,
      membershipLevelId: Number(current_level) + 1,
      membershipLevelTimestamp: Number(level_timestamp[current_level]),
      status: !!Number(active) ? 'active' : 'pending',
      region,
      latitude: Number(latitude),
      longitude: Number(longitude),
    })
  }

  toRecord() {
    return this
  }
}
