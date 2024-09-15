import { UserSlice } from '@/module/user';

export interface LoginRequestDto {
  login: string;
  password: string;
  errorCode?: number;
}

export interface LoginResponseDto extends UserSlice {
  access_token: string;
  errorCode?: number;
}
