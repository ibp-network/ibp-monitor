import {
  Model,
  Table,
  Column,
  DataType,
  Sequelize,
  BelongsTo,
} from 'sequelize-typescript';
import { Monitor } from './monitor.js';
import { Service } from './service.js';
import { Member } from './member.js';
import { MemberServiceNode } from './member-service-node.js';

@Table({
  tableName: 'health_check',
  timestamps: false,
  defaultScope: {
    attributes: {
      exclude: [],
    },
    order: [['id', 'DESC']],
  },
})
export class HealthCheck extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id: number;
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  monitorId: string;
  @Column({
    type: DataType.STRING(128),
    allowNull: false,
  })
  serviceId: string;
  @Column({
    type: DataType.STRING(128),
    allowNull: false,
  })
  memberId: string;
  // peer id can be null when the service is unreachable
  @Column({
    type: DataType.STRING(64),
    allowNull: true,
  })
  peerId: string;
  @Column({
    type: DataType.ENUM('check', 'gossip'),
    allowNull: false,
  })
  source: string;
  @Column({
    type: DataType.ENUM(
      'service_check',
      'system_health',
      'best_block',
      'bootnode_check',
    ),
    allowNull: false,
  })
  type: string;
  @Column({
    type: DataType.ENUM('error', 'warning', 'success'),
    allowNull: false,
  })
  status: string;
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  responseTimeMs: number;
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  record: object;
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('now'),
  })
  createdAt: Date;
  // @Column({
  //   type: DataType.DATE,
  //   allowNull: false,
  //   defaultValue: Sequelize.fn('now'),
  // })
  // updatedAt: Date;

  // RELATIONS
  @BelongsTo(() => Monitor, {
    foreignKey: 'monitorId',
  })
  monitor: Model<Monitor>;
  @BelongsTo(() => Service, {
    foreignKey: 'serviceId',
  })
  service: Model<Service>;
  @BelongsTo(() => Member, {
    as: 'member',
    foreignKey: 'memberId',
  })
  member: Model<Member>;
  @BelongsTo(() => MemberServiceNode, {
    foreignKey: 'peerId',
  })
  node: Model<MemberServiceNode>;
}