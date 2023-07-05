import * as dotenv from 'dotenv';
dotenv.config({ debug: true });

console.log('dotenv loaded');
console.log('HTTP_PORT', process.env.HTTP_PORT);
console.log('P2P_PORT', process.env.P2P_PORT);
console.log('P2P_PUBLIC_PORT', process.env.P2P_PUBLIC_PORT);
console.log('P2P_PUBLIC_HOST', process.env.P2P_PUBLIC_HOST);

console.log('DB_HOST', process.env.DB_HOST);
console.log('DB_PORT', process.env.DB_PORT);
console.log('DB_USER', process.env.DB_USER);
