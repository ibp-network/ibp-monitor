import {
  Model,
  Table,
  Column,
  DataType,
  Sequelize,
  HasMany,
} from 'sequelize-typescript';
import { HealthCheck } from './health-check.js';

@Table({ tableName: 'monitor', timestamps: true, updatedAt: 'updatedAt' })
export class Monitor extends Model {
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    primaryKey: true,
  })
  id: string;
  @Column({
    type: DataType.STRING(128),
    allowNull: true,
  })
  name: string;
  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
  multiaddress: string[];
  @Column({
    type: DataType.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
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
  @HasMany(() => HealthCheck, {
    foreignKey: 'monitorId',
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  healthChecks: HealthCheck[];
}
