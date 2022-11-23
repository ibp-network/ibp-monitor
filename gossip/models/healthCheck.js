import { DataTypes } from 'sequelize'

const healthCheckModel = {
  // tableName: 'peers',
  definition: {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // dateTime: { type: DataTypes.STRING },
    peerId: { type: DataTypes.STRING },
    serviceId: { type: DataTypes.STRING },
    record: { type: DataTypes.JSON },
  }, 
  options: {
    tableName: 'health_checks',
    timestamps: true,
    createdAt: true,
    updatedAt: false
  }
}

export {
  healthCheckModel
}
