import { IsBIC, IsString, MaxLength, MinLength } from 'class-validator';

export default class UserSetIbanDto {
  @IsString()
  @MinLength(20)
  data: string;

  @IsBIC()
  @MaxLength(11)
  bic: string;
}
