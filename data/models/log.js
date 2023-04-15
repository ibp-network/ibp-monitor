import { DataTypes, Sequelize } from 'sequelize'

export const logModel = {
  definition: {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    level: {
      type: DataTypes.ENUM('trace', 'debug', 'info', 'warning', 'error'),
      allowNull: false,
    },
    peerId: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    memberServiceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
    },
  },
  options: {
    tableName: 'log',
    timestamps: true,
    createdAt: true,
    updatedAt: false,
    defaultScope: {
      attributes: {
        exclude: [],
      },
      order: [['id', 'ASC']],
    },
  },
}
