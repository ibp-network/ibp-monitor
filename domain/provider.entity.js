import { MemberEntity } from './member.entity.js'

/**
 * Represents an entity that might (or not) be a member of the IBP network,
 * and that hosts nodes for the services provided by the network
 */
export class ProviderEntity {
  /** @type {String} */ id
  /** @type {String} */ name
  /** @type {String} */ websiteUrl
  /** @type {String} */ logoUrl

  /** @type {'active' | 'pending'} */ status

  /** @type {'' | 'africa' | 'asia' | 'central_america' | 'europe' | 'middle_east' | 'north_america' | 'oceania'} */
  region

  /** @type {Number} */ latitude
  /** @type {Number} */ longitude

  /** @type {MemberEntity} */ member

  /**
   * @param {ProviderEntity} initializator
   * @param {MemberEntity} member
   */
  constructor({ id, name, websiteUrl, logoUrl, status, region, latitude, longitude }, member) {
    this.id = id
    this.name = name
    this.websiteUrl = websiteUrl
    this.logoUrl = logoUrl
    this.status = status
    this.region = region
    this.latitude = latitude
    this.longitude = longitude
    this.member = member
  }

  /**
   * Takes a config object as input (typically from a JSON file) and
   * turns it into a member entity
   * @param {Record<string, unknown>} configObject
   * @returns {ProviderEntity}
   */
  static fromConfig(configObject, isMember) {
    const {
      id,
      name = configObject.id,
      website = null,
      logo = null,
      active = '0',
      region = '',
      latitude = '0.0000',
      longitude = '0.0000',
    } = configObject

    return new ProviderEntity(
      {
        id,
        name,
        websiteUrl: website,
        logoUrl: logo,
        status: !!Number(active) ? 'active' : 'pending',
        region,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      isMember ? MemberEntity.fromConfig(configObject) : undefined
    )
  }

  /**
   * Takes a Member object from the data store, and converts it into a
   * {@link ProviderEntity}
   * @param {Record<string, unknown>} configObject
   * @returns {ProviderEntity}
   */
  static fromDataStore(record) {
    if (record.member) {
      // Eager-loaded as Provider>Member
      let { member, ...provider } = record
      return new ProviderEntity(provider, new MemberEntity(member))
    } else {
      // Eager-loaded as Provider>Member
      let { provider, ...member } = record
      return new ProviderEntity(provider, new MemberEntity(member))
    }
  }

  toRecord() {
    return this
  }
}
