export default class AccessTokenResDto {
  access_token: string;
  firstName: string;
  currentBalance: number;
  paymentMethodRegistered: string | null;
  processed: boolean;
  eligible: boolean;
}
