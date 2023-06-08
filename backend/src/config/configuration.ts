import fs from 'fs';
// config/configuration.ts
const { version } = JSON.parse(fs.readFileSync('../package.json', 'utf8'));

export default () => ({
  app: {
    version,
  },
});
