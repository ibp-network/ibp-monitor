import { DataTypes, Sequelize } from 'sequelize'

export const memberModel = {
  definition: {
    id: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
    },
    providerId: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    serviceIpAddress: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    monitorUrl: {
      type: DataTypes.STRING(256),
      allowNull: true,
    },
    membershipType: {
      type: DataTypes.ENUM('hobbyist', 'professional'),
      allowNull: false,
    },
    membershipLevelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    membershipLevelTimestamp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'pending'),
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
    tableName: 'member',
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
