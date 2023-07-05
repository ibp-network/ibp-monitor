// required for sequelize migrations only.

// DO NOT run this cjs file directly.
// run this script with `node run migrate` from the ./backend directory.

require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,         // 'ibp-datastore',
  port: process.env.DB_PORT,         // 3306,
  database: process.env.DB_NAME,     // 'ibp_monitor_v02',
  username: process.env.DB_USERNAME, // 'ibp_monitor',
  password: process.env.DB_PASSWORD, // 'ibp_monitor',
  dialect: process.env.DB_DIALECT,   // 'mariadb',
  options: {
    dialect: process.env.DB_DIALECT, // 'mariadb',
    logging: process.env.DB_LOGGING, // false,
  },
  // config for sequelize-cli / umzug
  migrationStorageTableName: 'sequelize_migrations',
}
// console.debug('dbConfig', dbConfig);

module.exports = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig
};
