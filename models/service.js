import { DataTypes } from 'sequelize'

const serviceModel = {
  definition: {
    id: { type: DataTypes.STRING(32), primaryKey: true },
    type: { type: DataTypes.STRING(32) },
    name: { type: DataTypes.STRING(64) },
    endpoint: { type: DataTypes.STRING(64) },
    level_required: { type: DataTypes.INTEGER },
    parachain: { type: DataTypes.BOOLEAN },
    parentId: { type: DataTypes.STRING(32) },
    status: { type: DataTypes.STRING(16) },
    logo: { type: DataTypes.STRING(256) },
  },
  options: {
    tableName: 'service',
    // timestamps: true,
    createdAt: false,
    updatedAt: false,
  },
}

export { serviceModel }
