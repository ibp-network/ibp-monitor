import {
  Column,
  DataType,
  Model,
  Table,
  HasMany,
  Sequelize,
} from 'sequelize-typescript';
import { Member } from '../models/member.js';
import { Service } from '../models/service.js';

@Table({
  tableName: 'membership_level',
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
export class MembershipLevel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  id: number;
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  name: string;
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  subdomain: string;
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('now'),
  })
  createdAt: Date;
  // RELATIONS
  @HasMany(() => Member, {
    as: 'members',
    foreignKey: 'membershipLevelId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  members: Member[];
  @HasMany(() => Service, {
    foreignKey: 'membershipLevelId',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  services: Service[];
}
