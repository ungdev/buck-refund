export default class AccessTokenResDto {
  access_token: string;
  firstName: string;
  currentBalance: number;
  paymentMethodRegistered: { iban: string; bic: string } | null;
  processed: boolean;
  eligible: boolean;
  operation: 'administrate' | 'refund';
}
