import { DataTypes } from 'sequelize'

const serviceModel = {
  definition: {
    url: { type: DataTypes.STRING, primaryKey: true },
    serviceId: { type: DataTypes.STRING },
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
