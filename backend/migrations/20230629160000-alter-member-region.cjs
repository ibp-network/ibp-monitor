
async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    ALTER TABLE member
    MODIFY region 
    ENUM('africa','asia','central_america','europe','middle_east','north_america','oceania', '') 
    NOT NULL DEFAULT '';
  `);
}

async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    ALTER TABLE member
    MODIFY region 
    ENUM('africa','asia','central_america','europe','middle_east','north_america','oceania') 
    NOT NULL;
  `);
};

module.exports = { up, down }
