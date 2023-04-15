import { DataTypes, Sequelize } from 'sequelize'

export const memberServiceModel = {
  definition: {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    memberId: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.STRING(128),
      allowNull: false,
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
