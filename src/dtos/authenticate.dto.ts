import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'chicken@gmail.com',
    nullable: false,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '@Test1234',
    nullable: false,
  })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'prochicken3',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  username: string;
}

export class LoginNormalDto {
  @ApiProperty({
    example: '@Test1234',
    nullable: false,
  })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'prochicken3',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  username: string;
}
