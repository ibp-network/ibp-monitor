import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  // Remove the foreign key constraint
  console.log('Removing the foreign key constraint')
  queryInterface
    .removeConstraint('member_service_node', 'member_service_node_ibfk_3')
      // drop column memberServiceId from table member_service_node
    .then(() =>
      queryInterface.removeColumn('member_service_node', 'memberServiceId')
    )
    // Remove the AUTO_INCREMENT property from the id column
    .then(() =>
      queryInterface.changeColumn('member_service', 'id', {
        type: DataTypes.INTEGER,
        allowNull: true,
        autoIncrement: false,
        // primaryKey: true,
      })
    )
    // Remove the primary key constraint on column id
    .then(() =>
      queryInterface.removeConstraint('member_service', 'PRIMARY')
    )
    // Populate a temporary table with the distinct records based on memberId and serviceId
    .then(() =>
      queryInterface.sequelize.query(`
        CREATE TEMPORARY TABLE temp_member_service AS 
        SELECT * FROM (
          SELECT *,
            ROW_NUMBER() OVER (PARTITION BY memberId, serviceId ORDER BY updatedAt DESC) AS rn
          FROM member_service
        ) t
        WHERE rn = 1;
      `)
    )
    // Delete the records in the member_service table that do not exist in the temporary table
    .then(() =>
      queryInterface.sequelize.query(`
        DELETE FROM member_service
        WHERE (memberId, serviceId, updatedAt) NOT IN (
          SELECT memberId, serviceId, updatedAt FROM temp_member_service
        );
      `)
    )
    // Drop column id
    .then(() =>
      queryInterface.removeColumn('member_service', 'id')
    )
    // Create the new PK constraint
    .then(() =>
      queryInterface.addConstraint('member_service', {
        type: 'primary key',
        fields: ['memberId', 'serviceId'],
        name: 'member_service_pk',
      })
    )

}

async function down({ context: queryInterface }) {
  // In this case, the down migration is hard to implement because we cannot undo the deletion of rows and removal of id column.
  // Therefore, it's better to backup your database before running the up migration.
  // throw new Error('This migration cannot be undone');
}

export { up, down }
