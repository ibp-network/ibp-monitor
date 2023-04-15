import { DataTypes, Sequelize } from 'sequelize'

export const membershipLevelModel = {
  definition: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    subdomain: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
    },
  },
  options: {
    tableName: 'membership_level',
    timestamps: true,
    createdAt: true,
    updatedAt: false,
    defaultScope: {
      attributes: {
        exclude: ['createdAt'],
      },
      order: [['id', 'ASC']],
    },
  },
}
