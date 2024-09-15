import { UserSlice } from '@/module/user';

export type IsLoggedInResponseDto =
  | {
      valid: false;
    }
  | ({
      valid: true;
    } & UserSlice);
