import { DataTypes } from 'sequelize'

const peerModel = {
  // tableName: 'peers',
  // pk: ['peerId'],
  definition: {
    peerId: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING },
  }, 
  options: {
    tableName: 'peers',
    timestamps: true,
    createdAt: true,
    updatedAt: true
  }
}

export {
  peerModel
}
