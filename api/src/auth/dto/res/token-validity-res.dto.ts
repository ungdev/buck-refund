export default class TokenValidityResDto {
  valid: boolean;
  firstName: string;
  currentBalance: number;
  paymentMethodRegistered: string | null;
  processed: boolean;
  eligible: boolean;
  operation: false | 'administrate' | 'refund';
}
