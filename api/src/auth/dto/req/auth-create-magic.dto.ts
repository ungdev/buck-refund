import { IsEmail, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export default class AuthCreateMagicDto {
  @IsNotEmpty()
  @IsEmail()
  login: string;

  @IsOptional()
  @Min(2010)
  @Max(2025)
  graduationYear?: number;
}
