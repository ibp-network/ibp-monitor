import { DataTypes, Sequelize } from 'sequelize'

export const chainModel = {
  definition: {
    id: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true,
    },
    genesisHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    relayChainId: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    logoUrl: {
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
    tableName: 'chain',
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
