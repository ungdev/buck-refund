import { IsIBAN, IsString } from 'class-validator';

export default class UserSetIbanDto {
  @IsString()
  @IsIBAN()
  data: string;
}
