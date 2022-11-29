import { DataTypes } from 'sequelize'

const serviceModel = {
  definition: {
    // serviceId: { type: DataTypes.STRING(64), primaryKey: true },
    serviceUrl: { type: DataTypes.STRING(132), primaryKey: true },
    name: { type: DataTypes.STRING(64) },
    chain: { type: DataTypes.STRING(64) },
    // // this peer will host the service
    // peerId: { type: DataTypes.STRING(64) },
    // latest stats from healthCheck
    status: { type: DataTypes.JSON },
  },
  options: {
    tableName: 'service',
    timestamps: true,
    createdAt: true,
    updatedAt: true
  }
}

export {
  serviceModel
}
