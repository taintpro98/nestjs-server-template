import { UserModel } from '@models';
import { InjectModel, Repository } from '@modules/objection';
import { IUserRepository } from './interfaces/user.interface';
import { UserFilter } from '@filters';
import { AnyQueryBuilder } from 'objection';

export class UserRepository
  extends Repository<UserModel>
  implements IUserRepository
{
  @InjectModel(UserModel)
  model: UserModel;

  static get tableName() {
    return UserModel.tableName;
  }

  static extendQueryFilter(
    query: AnyQueryBuilder,
    filter: UserFilter,
  ): AnyQueryBuilder {
    if (filter?.ids?.length) {
      query = query.whereIn(`${this.tableName}.id`, filter.ids);
    }
    if (filter?.emails?.length) {
      query = query.whereIn(`${this.tableName}.email`, filter.emails);
    }
    if (filter?.usernames?.length) {
      query = query.whereIn(`${this.tableName}.username`, filter.usernames);
    }
    return query;
  }

  async list(filter?: UserFilter): Promise<UserModel[]> {
    const query = UserRepository.queryFilter(this.query(), filter);
    return query;
  }
}
