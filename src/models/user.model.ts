import { BaseModel } from '@modules/objection';

class UserModel extends BaseModel {
  static tableName = 'users';
  static connection = 'postgres';
  static useUUID = true;
  static softDelete = true;

  id: string;
  username: string;
  email?: string;
  password?: string;

  static jsonSchema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      username: { type: 'string' },
      email: { type: 'string', nullable: true },
      password: { type: 'string', nullable: true },
    },
  };
}

export default UserModel;
