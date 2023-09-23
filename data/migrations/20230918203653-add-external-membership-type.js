import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  try {
    await queryInterface.changeColumn('member', 'membershipType', {
      type: DataTypes.ENUM('hobbyist', 'professional', 'external'),
      allowNull: false,
    })
  } catch (err) {
    console.warn('Warning: could not change member.membershipType', { err })
  }
}

async function down({ context: queryInterface }) {
  try {
    await queryInterface.bulkDelete('member', null, {})
    await queryInterface.changeColumn('member', 'membershipType', {
      type: DataTypes.ENUM('hobbyist', 'professional'),
      allowNull: false,
    })
  } catch (err) {
    console.warn('Warning: could not change back member.membershipType', { err })
  }
}

export { up, down }
