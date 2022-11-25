import { DataTypes } from 'sequelize'

const healthCheckModel = {
  // tableName: 'peers',
  definition: {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // dateTime: { type: DataTypes.STRING },
    peerId: { type: DataTypes.STRING(64) },
    serviceId: { type: DataTypes.STRING(64) },
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
