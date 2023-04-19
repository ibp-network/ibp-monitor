import { DataTypes, Sequelize } from 'sequelize'

export const memberServiceNodeModel = {
  definition: {
    peerId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true,
    },
    serviceId: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    memberId: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    memberServiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: true,
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
    tableName: 'member_service_node',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
  },
}
