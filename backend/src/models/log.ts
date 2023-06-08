import {
  Model,
  Table,
  Column,
  DataType,
  Sequelize,
  BelongsTo,
} from 'sequelize-typescript';
import { MemberServiceNode } from './member-service-node.js';
import { MemberService } from './member-service.js';

@Table({
  tableName: 'log',
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
export class Log extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id: string;
  @Column({
    type: DataType.ENUM('trace', 'debug', 'info', 'warning', 'error'),
    allowNull: false,
  })
  level: string;
  @Column({
    type: DataType.STRING(64),
    allowNull: true,
  })
  peerId: string;
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  memberServiceId: number;
  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  data: string;
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('now'),
  })
  createdAt: Date;
  // RELATIONS
  @BelongsTo(() => MemberServiceNode, {
    foreignKey: 'peerId',
  })
  node: Model<MemberServiceNode>;
  @BelongsTo(() => MemberService, {
    as: 'memberService',
    foreignKey: 'memberServiceId',
  })
  memberService: Model<MemberService>;
}
