import * as dotenv from 'dotenv';
dotenv.config({ debug: true });

console.log('dotenv loaded');
console.log('HTTP_PORT', process.env.HTTP_PORT);
console.log('TCP_PORT', process.env.TCP_PORT);
console.log('P2P_PUBLIC_PORT', process.env.P2P_PUBLIC_PORT);
console.log('P2P_PUBLIC_HOST', process.env.P2P_PUBLIC_HOST);
