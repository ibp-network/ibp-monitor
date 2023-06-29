
async function up({ context: queryInterface }) {
  await queryInterface.sequelize.query(`
    ALTER TABLE member
    MODIFY region 
    ENUM('africa','asia','central_america','europe','middle_east','north_america','oceania', '') 
    NOT NULL DEFAULT '';
  `);
}

async function down({ context: queryInterface }) {
  await queryInterface.sequelize.query(`
    ALTER TABLE member
    MODIFY region 
    ENUM('africa','asia','central_america','europe','middle_east','north_america','oceania') 
    NOT NULL;
  `);
};

export { up, down }
