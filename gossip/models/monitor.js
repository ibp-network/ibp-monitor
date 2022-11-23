import { DataTypes } from 'sequelize'

const monitorModel = {
  // tableName: 'peers',
  definition: {
    peerId: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING },
    services: { type: DataTypes.JSON },
  },
  options: {
    tableName: 'monitor',
    timestamps: true,
    createdAt: true,
    updatedAt: true
  }
}

export {
  monitorModel
}
