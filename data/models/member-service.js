import { DataTypes, Sequelize } from 'sequelize'

export const memberServiceModel = {
  definition: {
    memberId: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
    },
    serviceId: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
    },
    serviceUrl: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
    },
  },
  options: {
    tableName: 'member_service',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
  },
}
