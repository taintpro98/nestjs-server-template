const config: any = {
  postgres: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'migrations',
      extension: 'ts',
      directory: '../database/migrations',
    },
    seeds: {
      extension: 'ts',
      directory: '../database/seeders',
    },
  },
};

export default config;
