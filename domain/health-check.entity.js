export class HealthCheckEntity {
  /** @type {string} */ monitorId
  /** @type {string} */ serviceId
  /** @type {string} */ providerId
  /** @type {string?} */ memberId
  /** @type {string?} */ peerId
  /** @type {'check' | 'gossip'} */ source
  /** @type {'serivce_check' | 'system_health' | 'best_block'} */ type
  /** @type {'success' | 'warning' | 'error'} */ status
  /** @type {number} */ responseTimeMs
  /** @type {Object} */ record

  /**
   * @param {HealthCheckEntity} initializer
   */
  constructor({
    monitorId,
    serviceId,
    providerId,
    memberId,

    peerId,
    source,
    type,
    status,
    responseTimeMs,

    record,
  }) {
    this.monitorId = monitorId
    this.serviceId = serviceId
    this.providerId = providerId
    this.memberId = memberId
    this.peerId = peerId
    this.source = source
    this.type = type
    this.status = status
    this.responseTimeMs = responseTimeMs
    this.record = record
  }
}
