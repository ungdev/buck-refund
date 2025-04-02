import { IsAscii, IsNotEmpty } from 'class-validator';

export default class AuthDeleteMagicDto {
  @IsNotEmpty()
  @IsAscii()
  spell: string;
}
