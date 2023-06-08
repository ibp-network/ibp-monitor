// enum EAllowedTopics {
//   '/ibp',
//   '/ibp/services',
//   '/ibp/healthCheck',
//   '/ibp/signedMessage',
// }

export interface ISequelizeOptions {
  database: string; // 'ibp_monitor',
  username: string; // 'ibp_monitor',
  password: string; // 'ibp_monitor',
  options: {
    dialect: string; // 'mariadb',
    // hostname = docker service name
    // host: 'ibp-datastore',
    host: string; // 'localhost',
    port: number; // 3306,
    logging: boolean | Function; // false,
  };
}

export interface IRedisOptions {
  host: string; // 'ibp-redis',
  port: number; // 6379,
}

export interface IPruningOptions {
  age: number; // 90 * 24 * 60 * 60, // 90 days as seconds
  interval: number; // 1 * 60 * 60, // 1 hour as seconds
}
