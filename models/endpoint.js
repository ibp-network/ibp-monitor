import { DataTypes } from 'sequelize'

const endpointModel = {
  definition: {
    memberId: { type: DataTypes.STRING(64) },
    serviceId: { type: DataTypes.STRING(64), primaryKey: true },
    serviceUrl: { type: DataTypes.STRING(132), primaryKey: true },
    name: { type: DataTypes.STRING(64) },
    chain: { type: DataTypes.STRING(64) },
    // // this peer will host the service
    // peerId: { type: DataTypes.STRING(64) },
    // latest stats from healthCheck
    status: { type: DataTypes.STRING(16) },
    errorCount: { type: DataTypes.INTEGER },
  },
  options: {
    tableName: 'endpoint',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
  },
}

export { endpointModel }
