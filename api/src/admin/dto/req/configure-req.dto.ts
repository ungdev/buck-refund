import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsAscii, IsBIC, IsIBAN, IsOptional, MaxLength } from 'class-validator';

export default class ConfigurationReqDto {
  @IsOptional()
  @IsIBAN()
  debtor_iban?: string;

  @IsOptional()
  @IsBIC()
  debtor_bic?: string;

  @IsOptional()
  @IsAscii()
  debtor_name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  @MaxLength(70, { each: true })
  @Type(() => String)
  debtor_address?: [string, string];
}
