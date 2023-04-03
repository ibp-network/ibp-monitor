import { DataTypes } from 'sequelize'

const domainModel = {
  definition: {
    // serviceId: { type: DataTypes.STRING(64), primaryKey: true },
    id: { type: DataTypes.STRING(132), primaryKey: true },
    level_required: { type: DataTypes.INTEGER }
  },
  options: {
    tableName: 'domain',
    // timestamps: true,
    createdAt: false,
    updatedAt: false
  }
}

export {
  domainModel
}
