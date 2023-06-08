import {
  Model,
  Table,
  Column,
  DataType,
  Sequelize,
} from 'sequelize-typescript';

@Table({
  tableName: 'geo_dns_pool',
  timestamps: true,
  createdAt: true,
  updatedAt: false,
  defaultScope: {
    order: [['id', 'ASC']],
  },
})
export class GeoDnsPool extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  })
  id: string;
  @Column({
    type: DataType.STRING(128),
    allowNull: false,
  })
  name: string;
  @Column({
    type: DataType.STRING(256),
    allowNull: true,
  })
  host: string;
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('now'),
  })
  createdAt: Date;
}
