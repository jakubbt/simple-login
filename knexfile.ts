const config = require('./src/config.ts');

module.exports = {
  client: 'mysql2',
  connection: config.default.database.connection,
};