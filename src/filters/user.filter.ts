import { BaseFilter } from '@modules/objection';
import { TransformArrayString } from '@validators';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class UserFilter extends BaseFilter {
  @IsOptional()
  @TransformArrayString()
  @IsUUID(4, { each: true })
  ids?: string[];

  @IsOptional()
  @IsEmail({}, { each: true })
  emails?: string[];

  @IsOptional()
  @IsString({ each: true })
  usernames?: string[];
}
