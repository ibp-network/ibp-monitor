import { DataTypes, Sequelize } from 'sequelize'

export const geoDnsPoolModel = {
  definition: {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    host: {
      type: DataTypes.STRING(256),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
    },
  },
  options: {
    tableName: 'geo_dns_pool',
    timestamps: true,
    createdAt: true,
    updatedAt: false,
    defaultScope: {
      order: [['id', 'ASC']],
    },
  },
}
