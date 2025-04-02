import { IsEmail, IsNotEmpty } from 'class-validator';

export default class AuthCreateMagicDto {
  @IsNotEmpty()
  @IsEmail()
  login: string;
}
