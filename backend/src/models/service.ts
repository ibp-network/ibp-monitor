import {
  Table,
  Column,
  DataType,
  Model,
  Sequelize,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Chain } from './chain.js';
import { MembershipLevel } from './membership-level.js';
import { MemberServiceNode } from './member-service-node.js';
import { HealthCheck } from './health-check.js';

@Table({ tableName: 'service' })
export class Service extends Model {
  @Column({
    type: DataType.STRING(128),
    allowNull: false,
    primaryKey: true,
  })
  id: string;
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  chainId: string;
  @Column({
    type: DataType.ENUM('rpc', 'bootnode'),
    allowNull: false,
  })
  type: string;
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  membershipLevelId: number;
  @Column({
    type: DataType.ENUM('active', 'planned'),
    allowNull: false,
  })
  status: string;
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('now'),
  })
  createdAt: Date;
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('now'),
  })
  updatedAt: Date;
  // RELATIONS
  @BelongsTo(() => Chain, {
    foreignKey: 'chainId',
  })
  chain: Model<Chain>;
  @BelongsTo(() => MembershipLevel, {
    foreignKey: 'membershipLevelId',
  })
  membershipLevel: Model<MembershipLevel>;
  @HasMany(() => MemberServiceNode, {
    foreignKey: 'serviceId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  nodes: Model<MemberServiceNode>[];
  @HasMany(() => HealthCheck, {
    foreignKey: 'serviceId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  healthChecks: Model<HealthCheck>[];
}
