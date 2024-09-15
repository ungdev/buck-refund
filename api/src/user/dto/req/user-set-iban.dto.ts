import { IsString, MaxLength, MinLength } from 'class-validator';

export default class UserSetIbanDto {
  @IsString()
  @MaxLength(34)
  @MinLength(14)
  data: string;
}
