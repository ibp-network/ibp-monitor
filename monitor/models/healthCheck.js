import { DataTypes } from 'sequelize'

const healthCheckModel = {
  // tableName: 'peers',
  definition: {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // dateTime: { type: DataTypes.STRING },
    monitorId: { type: DataTypes.STRING(64) },
    serviceId: { type: DataTypes.STRING(64) },
    peerId: { type: DataTypes.STRING(64) }, // networkId of the validator
    source: { type: DataTypes.STRING(10) }, // gossip, check
    level: { type: DataTypes.STRING(10) }, // log, error, info?
    record: { type: DataTypes.JSON },
  }, 
  options: {
    tableName: 'health_check',
    timestamps: true,
    createdAt: true,
    updatedAt: false
  }
}

export {
  healthCheckModel
}
