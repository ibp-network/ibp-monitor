import { DataTypes, Sequelize } from 'sequelize'

export const healthCheckModel = {
  definition: {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    monitorId: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    memberId: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    // peer id can be null when the service is unreachable
    peerId: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM('check', 'gossip'),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('service_check', 'system_health', 'best_block'),
      allowNull: false,
    },
    checkOrigin: {
      type: DataTypes.ENUM('member', 'external'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('error', 'warning', 'success'),
      allowNull: false,
    },
    responseTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    record: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('now'),
    },
  },
  options: {
    tableName: 'health_check',
    timestamps: true,
    createdAt: true,
    updatedAt: false,
    defaultScope: {
      attributes: {
        exclude: [],
      },
      order: [['id', 'DESC']],
    },
  },
}
