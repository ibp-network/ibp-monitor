import {
  Model,
  Table,
  Column,
  DataType,
  Sequelize,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Member } from './member.js';
import { MemberServiceNode } from './member-service-node.js';
// import { Log } from './log.js';

@Table({ tableName: 'member_service' })
export class MemberService extends Model {
  // @Column({
  //   type: DataType.INTEGER,
  //   autoIncrement: true,
  //   allowNull: false,
  //   primaryKey: true,
  // })
  // id: number;
  @Column({
    type: DataType.STRING(128),
    allowNull: false,
    primaryKey: true,
  })
  memberId: string;
  @Column({
    type: DataType.STRING(128),
    allowNull: false,
    primaryKey: true,
  })
  @Column
  serviceId: string;
  @Column({
    type: DataType.STRING(256),
    allowNull: false,
  })
  serviceUrl: string;
  @Column({
    type: DataType.ENUM('active', 'inactive'),
    allowNull: false,
  })
  status: string;
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
  // RELATIONS
  @BelongsTo(() => Member, {
    foreignKey: 'memberId',
  })
  member: Model<Member>;
  // @HasMany(() => MemberServiceNode, {
  //   foreignKey: 'memberServiceId',
  //   onDelete: 'RESTRICT',
  //   onUpdate: 'RESTRICT',
  // })
  nodes: Model<MemberServiceNode>[];
  // @HasMany(() => Log, {
  //   foreignKey: 'memberServiceId',
  //   onDelete: 'RESTRICT',
  //   onUpdate: 'RESTRICT',
  // })
  // logs: Model<Log>[];
}
