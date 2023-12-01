export class MembershipLevelEntity {
  /** @type {number} */ id
  /** @type {string} */ name
  /** @type {string} */ subdomain

  constructor({ id, name, subdomain }) {
    this.id = id
    this.name = name
    this.subdomain = subdomain
  }
}
