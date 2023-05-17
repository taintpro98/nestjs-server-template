import Knex from 'knex';
import { registerAs } from '@nestjs/config';
import { delay } from '@utils';
import config from './knex';

const db = Knex(config.postgres);

export async function checkDatabaseConnection() {
  let loop = 0;
  let error;
  while (loop < 10) {
    try {
      await db.raw('select 1+1 as result');
      console.log(
        `Connection has been established successfully.  (${config.postgres.connection.database} database)`,
      );
      return;
    } catch (err) {
      error = err;
    }
    loop++;
    await delay(1000);
  }
  console.error('Unable to connect to the database', error);
}

export const configDb = registerAs('db', () => ({
  isGlobal: true,
  default: 'postgres',
  connections: config,
}));
