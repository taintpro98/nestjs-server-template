import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';
import { PASSWORD_SALT_ROUND } from '../../constants';

export async function seed(knex: Knex): Promise<void> {
  if (process.env.HOST_NAME === 'localhost') {
    const passwordHash = await bcrypt.hash('@Test1234', PASSWORD_SALT_ROUND);
    await knex('users')
      .insert([
        {
          id: 'a4ce435e-5274-470e-83e8-c2cd81dd59af',
          username: 'bruno',
          email: 'bruno@gmail.com',
          password: passwordHash,
        },
      ])
      .onConflict('id')
      .merge();
  }
}
