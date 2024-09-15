import styles from './IbanInput.module.scss';
import { FC, Ref, forwardRef, useState } from 'react';
import Button from '@/components/UI/Button';

export const enum IbanValidity {
  INVALID = 0b00,
  IBAN = 0b01,
  BBAN = 0b10,
}

function IbanInput(
  {
    className = '',
    onEnter = () => {},
    placeholder,
    autoFocus = false,
    icon: Icon,
  }: {
    className?: string;
    placeholder?: string;
    autoFocus?: boolean;
    onEnter?: (valid: IbanValidity, value: string) => void;
    icon?: FC;
  },
  ref?: Ref<HTMLInputElement>,
) {
  const [iban, setIban] = useState('');
  const checkValidity = () => {
    const workingIban = iban.toUpperCase().replaceAll(/[^A-Z0-9]/g, '');

    // CHECK IBAN LENGTH
    if (workingIban.length < 14 || workingIban.length > 34) return onEnter(IbanValidity.INVALID, workingIban);

    // IBAN CHECK
    const ibanNumeric = BigInt(
      (workingIban.slice(4) + workingIban.slice(0, 4))
        .split('')
        .map((c) => (c >= 'A' && c <= 'Z' ? c.charCodeAt(0) - 55 : c))
        .join(''),
    );
    if (ibanNumeric % BigInt(97) !== BigInt(1)) return onEnter(IbanValidity.INVALID, workingIban);

    // BBAN CHECK
    const bban = workingIban.slice(4);
    const countryCode = workingIban.slice(0, 2);
    if (countryCode === 'FR') {
      // FRANCE RIB KEY CHECK
      if (workingIban.length !== 27) return onEnter(IbanValidity.INVALID, workingIban);
      const numericTransform = (c: string) =>
        c >= 'A' && c <= 'I'
          ? (c.charCodeAt(0) - 64) % 10
          : c >= 'J' && c <= 'R'
            ? (c.charCodeAt(0) - 73) % 10
            : c >= 'S' && c <= 'Z'
              ? (c.charCodeAt(0) - 81) % 10
              : c;
      const ribNumeric =
        Number.parseInt(bban.slice(0, 5).split('').map(numericTransform).join('')) * 89 +
        Number.parseInt(bban.slice(5, 10).split('').map(numericTransform).join('')) * 15 +
        Number.parseInt(bban.slice(10, -2).split('').map(numericTransform).join('')) * 3;
      const computedKey = (97 - (ribNumeric % 97)).toString().padStart(2, '0');
      return onEnter(
        computedKey !== bban.slice(-2) ? IbanValidity.INVALID : IbanValidity.IBAN & IbanValidity.BBAN,
        workingIban,
      );
    }
    console.warn(`No BBAN check has been implemented for country code ${countryCode}. Skipping BBAN check.`);
    return onEnter(IbanValidity.IBAN, workingIban);
  };

  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      <input
        ref={ref}
        onChange={(v) => setIban(v.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && checkValidity()}
        value={iban}
        placeholder={placeholder}
        type={'text'}
        autoFocus={autoFocus}
      />
      {Icon && (
        <Button noStyle onClick={() => checkValidity()} noTab>
          <Icon />
        </Button>
      )}
    </div>
  );
}

export default forwardRef(IbanInput);
