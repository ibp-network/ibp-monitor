class Model {}

class DataStore {
  Service = undefined
  Peer = undefined
  HealthCheck = undefined
  Log = undefined
  pruning = {
    age: 90 * 24 * 60 * 60, // days as seconds
    interval: 1 * 24 * 60 * 60, // 1 day as seconds
  }

  constructor() {}
}

class DataStoreLoki extends DataStore {
  constructor() {
    super()
  }
}
