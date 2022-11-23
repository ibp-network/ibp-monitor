import { DataTypes } from 'sequelize'

const serviceModel = {
  definition: {
    serviceId: { type: DataTypes.STRING, primaryKey: true },
    url: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    chain: { type: DataTypes.STRING },
    // this peer will host the service
    peerId: { type: DataTypes.STRING },
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
