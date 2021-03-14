require('dotenv').config()

export default {
  port: process.env.PORT,
  database: {
    type: 'mysql',
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    },
    migrations: {
      directory: __dirname + '/migrations',
    },
  },
};
