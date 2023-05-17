import { UserModel } from '@models';
import { Transformer } from './transformer';

export class UserTransformer extends Transformer<UserModel> {
  async transform(model: UserModel): Promise<Record<string, any>> {
    return {
      id: model.id,
      username: model.username,
    };
  }
}
