import { IsString, MinLength } from 'class-validator';

export default class UserSetIbanDto {
  @IsString()
  @MinLength(20)
  data: string;
}
