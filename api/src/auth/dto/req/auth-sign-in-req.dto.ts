import { IsAscii, IsNotEmpty, IsString } from 'class-validator';

export default class AuthSignInReqDto {
  @IsNotEmpty()
  @IsAscii()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
