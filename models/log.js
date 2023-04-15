import { DataTypes } from 'sequelize'

const logModel = {
  definition: {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    level: { type: DataTypes.STRING(10) }, // error, warning, info, debug
    peerId: { type: DataTypes.STRING(64) },
    serviceUrl: { type: DataTypes.STRING(64) },
    data: { type: DataTypes.JSON },
  },
  options: {
    tableName: 'log',
    timestamps: true,
    createdAt: true,
    updatedAt: false,
  },
}

export { logModel }
