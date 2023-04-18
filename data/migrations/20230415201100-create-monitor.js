import { monitorModel } from '../models/monitor.js'

async function up({ context: queryInterface }) {
  await queryInterface.createTable('monitor', monitorModel.definition)
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('monitor')
}

export { up, down }
