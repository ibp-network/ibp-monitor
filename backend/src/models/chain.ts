import {
  Model,
  Table,
  Column,
  DataType,
  Sequelize,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { Service } from './service.js';

@Table({
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
})
export class Chain extends Model {
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    primaryKey: true,
  })
  id: string;
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  genesisHash: string;
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  name: string;
  @Column({
    type: DataType.STRING(64),
    allowNull: true,
  })
  relayChainId: string;
  @Column({
    type: DataType.STRING(256),
    allowNull: true,
  })
  logoUrl: string;
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('now'),
  })
  createdAt: Date;
  // RELATIONS
  @HasMany(() => Chain, {
    foreignKey: 'relayChainId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  parachains: Model<Chain>[];
  @BelongsTo(() => Chain, {
    foreignKey: 'relayChainId',
  })
  relayChain: Model<Chain>;
  @HasMany(() => Service, {
    foreignKey: 'chainId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  services: Model<Service>[];
}
