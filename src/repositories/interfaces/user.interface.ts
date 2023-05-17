import { UserFilter } from '@filters';
import { UserModel } from '@models';
import { IRepository } from '@modules/objection';

export interface IUserRepository extends IRepository<UserModel> {
  list(filter?: UserFilter): Promise<UserModel[]>;
}
