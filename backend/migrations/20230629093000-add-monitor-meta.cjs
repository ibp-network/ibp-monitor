
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('monitor', 'meta', {
      type: Sequelize.DataTypes.JSON,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('monitor', 'meta');
  },
};
