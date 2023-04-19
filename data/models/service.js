import { DataTypes, Sequelize } from 'sequelize'

export const serviceModel = {
  definition: {
    id: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
    },
    chainId: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('rpc', 'bootnode'),
      allowNull: false,
    },
    membershipLevelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'planned'),
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
    tableName: 'service',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    defaultScope: {
      attributes: {
        exclude: [],
      },
      order: [['id', 'ASC']],
    },
  },
}
