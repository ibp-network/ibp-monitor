import { DataTypes } from 'sequelize'

const monitorModel = {
  // tableName: 'peers',
  definition: {
    monitorId: { type: DataTypes.STRING(64), primaryKey: true },
    name: { type: DataTypes.STRING(64) },
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
