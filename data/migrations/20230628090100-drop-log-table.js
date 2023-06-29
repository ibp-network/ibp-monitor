import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  // Start a transaction
  const transaction = await queryInterface.sequelize.transaction();
  try {

    // drop the log table
    await queryInterface.dropTable('log', { transaction });
    
    // Commit the transaction
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
