import { config } from '../config/config.js'
import { config as configLocal } from '../config/config.local.js'

export default Object.assign(config, configLocal)
