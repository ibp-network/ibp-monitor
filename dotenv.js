// due to the way dotenv works, we need to import it here
// the dotenv.config() call needs to complete before we can import anything else
import * as dotenv from 'dotenv'
dotenv.config()

// console.debug({
//   API_PORT: process.env.API_PORT,
//   HTTP_PORT: process.env.HTTP_PORT,
//   P2P_PUBLIC_PORT: process.env.P2P_PUBLIC_PORT,
// })
