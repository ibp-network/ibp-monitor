import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// config/configuration.ts
console.debug("__dirname: " + __dirname);
const { version } = JSON.parse(fs.readFileSync(__dirname + '/../../../package.json', 'utf8'));

export default () => ({
  app: {
    version,
  },
});
