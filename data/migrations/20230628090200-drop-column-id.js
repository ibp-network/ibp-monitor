import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
  // Remove the foreign key constraint
  console.log('Removing the foreign key constraint')
  await queryInterface
    // .removeConstraint('member_service_node', 'member_service_node_ibfk_3')
    .sequelize.query(`ALTER TABLE member_service_node DROP CONSTRAINT IF EXISTS member_service_node_ibfk_3;`, { transaction })
    .then(async () => {
      await queryInterface.sequelize.query(`ALTER TABLE member_service_node DROP CONSTRAINT IF EXISTS fk_member_service_node_member_service;`, { transaction })
    })
    .then(async () => {
      console.log('Dropping column memberServiceId from table member_service_node')
      // await queryInterface.removeColumn('member_service_node', 'memberServiceId', { transaction })
      await queryInterface.sequelize.query(`ALTER TABLE member_service_node DROP COLUMN IF EXISTS memberServiceId;`, { transaction })
    })
    .then(async () => {
      console.log('Removing the AUTO_INCREMENT property from the id column')
      await queryInterface.changeColumn('member_service', 'id', {
        type: DataTypes.INTEGER,
        allowNull: true,
        autoIncrement: false,
        primaryKey: false,
      }, { transaction })
    })
    // Remove the primary key constraint on column id
    .then(async () => {
      console.log('Removing the primary key constraint on column id')
      await queryInterface.removeConstraint('member_service', 'PRIMARY', { transaction })
    })
    // Populate a temporary table with the distinct records based on memberId and serviceId
    .then(async () => {
      console.log('Populating a temporary table with the distinct records based on memberId and serviceId')
      await queryInterface.sequelize.query(`
        CREATE TEMPORARY TABLE temp_member_service AS 
        SELECT * FROM (
          SELECT *,
            ROW_NUMBER() OVER (PARTITION BY memberId, serviceId ORDER BY updatedAt DESC) AS rn
          FROM member_service
        ) t
        WHERE rn = 1;
      `, { transaction })
    })
    // Delete the records in the member_service table that do not exist in the temporary table
    .then(async () => {
      console.log('Deleting the records in the member_service table that do not exist in the temporary table')
      await queryInterface.sequelize.query(`
        DELETE FROM member_service
        WHERE (memberId, serviceId, updatedAt) NOT IN (
          SELECT memberId, serviceId, updatedAt FROM temp_member_service
        );
      `, { transaction })
    })
    // Drop column id
    .then(async () => {
      console.log('Dropping column id from table member_service')
      await queryInterface.removeColumn('member_service', 'id', { transaction })
    })
    // Create the new PK constraint
    .then(async () => {
      console.log('Creating the new PK constraint')
      await queryInterface.addConstraint('member_service', {
        type: 'primary key',
        fields: ['memberId', 'serviceId'],
        name: 'member_service_pk',
      }, { transaction })
    })
    await transaction.commit();

  } catch (err) {
    // If there is an error, rollback the transaction
    await transaction.rollback();
    throw err;
  }

}

async function down({ context: queryInterface }) {
  // In this case, the down migration is hard to implement because we cannot undo the deletion of rows and removal of id column.
  // Therefore, it's better to backup your database before running the up migration.
  // throw new Error('This migration cannot be undone');
}

export { up, down }
