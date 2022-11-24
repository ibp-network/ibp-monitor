import { DataTypes } from 'sequelize'

const peerModel = {
  // tableName: 'peers',
  // pk: ['peerId'],
  definition: {
    peerId: { type: DataTypes.STRING(64), primaryKey: true },
    name: { type: DataTypes.STRING(64) },
  }, 
  options: {
    tableName: 'peer',
    timestamps: true,
    createdAt: true,
    updatedAt: true
  }
}

export {
  peerModel
}
