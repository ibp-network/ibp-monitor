import {
  Model,
  Table,
  Column,
  DataType,
  Sequelize,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { MemberService } from './member-service.js';
import { MembershipLevel } from './membership-level.js';
import { MemberServiceNode } from './member-service-node.js';
import { HealthCheck } from './health-check.js';

@Table({ tableName: 'member' })
export class Member extends Model {
  @Column({ type: DataType.STRING(128), primaryKey: true })
  id: string;

  @Column({ type: DataType.STRING(128) })
  name: string;

  @Column({ type: DataType.STRING(256), allowNull: true })
  websiteUrl: string;

  @Column({ type: DataType.STRING(256), allowNull: true })
  logoUrl: string;

  @Column({ type: DataType.STRING(64), allowNull: true })
  serviceIpAddress: string;

  @Column({ type: DataType.ENUM('hobbyist', 'professional'), allowNull: false })
  membershipType: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  membershipLevelId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  membershipLevelTimestamp: number;

  @Column({ type: DataType.STRING(132), allowNull: true })
  monitorUrl: string;

  @Column({ type: DataType.ENUM('active', 'pending'), allowNull: false })
  status: string;

  @Column({
    type: DataType.ENUM(
      'africa',
      'asia',
      'central_america',
      'europe',
      'middle_east',
      'north_america',
      'oceania',
    ),
  })
  region: string;

  @Column({ type: DataType.FLOAT, allowNull: true })
  latitude: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  longitude: number;

  // @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('now'),
  })
  createdAt: Date;

  // @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('now'),
  })
  updatedAt: Date;

  // Relationships

  @BelongsTo(() => MembershipLevel, {
    foreignKey: 'membershipLevelId',
  })
  membershipLevel: Model<MembershipLevel>;

  @HasMany(() => MemberService, {
    as: 'services',
    foreignKey: 'memberId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  services: Model<MemberService>[];

  @HasMany(() => MemberServiceNode, {
    foreignKey: 'memberId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  nodes: Model<MemberServiceNode>[];

  @HasMany(() => HealthCheck, {
    foreignKey: 'memberId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  healthChecks: Model<HealthCheck>[];
}
