import { DataTypes } from 'sequelize'

const memberModel = {
  // tableName: 'peers',
  // pk: ['peerId'],
  definition: {
    id: { type: DataTypes.STRING(64), primaryKey: true },
    name: { type: DataTypes.STRING(64) },
    website: { type: DataTypes.STRING(64) },
    logo: { type: DataTypes.STRING(256) },
    membership: { type: DataTypes.STRING(64) },
    current_level: { type: DataTypes.STRING(64) },
    level_timestamp: { type: DataTypes.STRING(64) },
    services_address: { type: DataTypes.STRING(64) },
    region: { type: DataTypes.STRING(64) },
    latitude: { type: DataTypes.STRING(64) },
    longitude: { type: DataTypes.STRING(64) },
    // payments: { type: DataTypes.STRING(64) },
  },
  options: {
    tableName: 'member',
    timestamps: true,
    createdAt: true,
    updatedAt: true
  }
}

export {
  memberModel
}
