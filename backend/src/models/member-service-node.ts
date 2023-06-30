import {
  Model,
  Table,
  Column,
  DataType,
  Sequelize,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Service } from './service.js';
import { Member } from './member.js';
import { MemberService } from './member-service.js';
import { HealthCheck } from './health-check.js';
// import { Log } from './log.js';

@Table({
  tableName: 'member_service_node',
  timestamps: true,
  createdAt: true,
  updatedAt: true,
})
export class MemberServiceNode extends Model {
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    primaryKey: true,
  })
  peerId: string;
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
  // @Column({
  //   type: DataType.INTEGER,
  //   allowNull: false,
  // })
  // memberServiceId: number;
  @Column({
    type: DataType.STRING(128),
    allowNull: true,
  })
  name: string;
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
  @BelongsTo(() => Service, {
    foreignKey: 'serviceId',
  })
  service: Model<Service>;
  @BelongsTo(() => Member, {
    foreignKey: 'memberId',
  })
  member: Model<Member>;
  // @BelongsTo(() => MemberService, {
  //   foreignKey: 'memberServiceId',
  // })
  // memberService: Model<MemberService>;
  @HasMany(() => HealthCheck, {
    foreignKey: 'peerId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  healthChecks: Model<HealthCheck>[];
  // @HasMany(() => Log, {
  //   foreignKey: 'peerId',
  //   onDelete: 'RESTRICT',
  //   onUpdate: 'RESTRICT',
  // })
  // logs: Model<Log>[];
}
