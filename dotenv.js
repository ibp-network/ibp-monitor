/*
 * This file is used to share configuration between the backend and the frontend.
 * 
 * In nodejs, imports are processed before the rest of the code. 
 * In some files we need config to be loaded before some of the imports.
 * 
 * By importing this file at the top of each file, we ensure that the config is loaded before any other imports.
 */
import * as dotenv from 'dotenv'
dotenv.config()

// console.debug({
//   API_PORT: process.env.API_PORT,
//   HTTP_PORT: process.env.HTTP_PORT,
//   P2P_PUBLIC_PORT: process.env.P2P_PUBLIC_PORT,
// })
