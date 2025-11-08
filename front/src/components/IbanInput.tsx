import styles from './IbanInput.module.scss';
import { Ref, forwardRef, useRef, useState } from 'react';
import Button from '@/components/UI/Button';
import Icons from '@/icons';
import { useAppTranslation } from '@/lib/i18n';

export const enum IbanValidity {
  INVALID = 0b00,
  IBAN = 0b01,
  BBAN = 0b10,
}

function IbanInput(
  {
    className = '',
    onEnter = async () => {},
    placeholder,
    bicPlaceholder,
    autoFocus = false,
  }: {
    className?: string;
    placeholder?: string;
    bicPlaceholder?: string;
    autoFocus?: boolean;
    onEnter?: (valid: IbanValidity, value: string, bic: string) => Promise<void>;
  },
  ref?: Ref<HTMLInputElement>,
) {
  const { t } = useAppTranslation();
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [loading, setLoading] = useState(false);
  const animationValueRef = useRef('');
  const [animationValue, setAnimationValue] = useState(t('common:dashboard.iban.placeholder'));

  const onEnterProxy = async (valid: IbanValidity, value: string, bic: string) => {
    if (valid === IbanValidity.INVALID) return onEnter(valid, value, bic);
    if (!bic) return onEnter(IbanValidity.INVALID, value, bic);
    animationValueRef.current = value;
    setAnimationValue(value);
    setLoading(true);
    const intervalId = setInterval(() => {
      // Move to next animation step
      const original = animationValueRef.current
        .split('')
        .map<[string, number]>((c, i) => [c, i])
        .filter(([c]) => c.match(/^[^@#=•/\\*%&?!§]$/));
      const chars = 'AZERTYUIOPQSDFGHJKLMWXCVBN0123456789#@=•\\/*%&?!§'.split('');
      const position =
        original.length > 0
          ? original[Math.max(Math.min(original.length, 2) - 1, Math.floor(Math.random() * original.length))][1]
          : Math.floor(Math.random() * animationValueRef.current.length);
      animationValueRef.current = `${animationValueRef.current.slice(0, position)}${chars[Math.floor(Math.random() * chars.length)]}${animationValueRef.current.slice(position + 1)}`;
      setAnimationValue(animationValueRef.current);
    }, 5);
    await onEnter(valid, value, bic);
    clearInterval(intervalId);
    setIban('');
    setBic('');
    setLoading(false);
  };

  const checkValidity = () => {
    const workingIban = iban.toUpperCase().replaceAll(/[^A-Z0-9]/g, '');

    // CHECK IBAN LENGTH
    if (workingIban.length < 14 || workingIban.length > 34) return onEnterProxy(IbanValidity.INVALID, workingIban, bic);

    // IBAN CHECK
    if (!/^[A-Z]{2}\d{2}/.test(workingIban)) return onEnterProxy(IbanValidity.INVALID, workingIban, bic);
    const ibanNumeric = BigInt(
      (workingIban.slice(4) + workingIban.slice(0, 4))
        .split('')
        .map((c) => (c >= 'A' && c <= 'Z' ? c.charCodeAt(0) - 55 : c))
        .join(''),
    );
    if (ibanNumeric % BigInt(97) !== BigInt(1)) return onEnterProxy(IbanValidity.INVALID, workingIban, bic);

    // BBAN CHECK
    const bban = workingIban.slice(4);
    const countryCode = workingIban.slice(0, 2);
    if (countryCode === 'FR') {
      // FRANCE RIB KEY CHECK
      if (workingIban.length !== 27) return onEnterProxy(IbanValidity.INVALID, workingIban, bic);
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
      return onEnterProxy(
        computedKey !== bban.slice(-2) ? IbanValidity.INVALID : IbanValidity.IBAN | IbanValidity.BBAN,
        workingIban,
        bic,
      );
    }
    console.warn(`No BBAN check has been implemented for country code ${countryCode}. Skipping BBAN check.`);
    return onEnterProxy(IbanValidity.IBAN, workingIban, bic);
  };

  const ibanify = (iban: string) => {
    const raw = iban
      .toUpperCase()
      .replaceAll(/[^A-Z0-9]/g, '')
      .split('');
    const spaceCount = Math.ceil(raw.length / 4 - 1);
    for (let i = spaceCount; i > 0; i--) {
      // Add a space every 4 characters
      raw.splice(i * 4, 0, ' ');
    }
    return raw.join('');
  };

  const bicify = (bic: string) => {
    return bic
      .toUpperCase()
      .replaceAll(/[^A-Z0-9]/g, '')
      .slice(0, 11);
  };

  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      {loading ? (
        <div className={styles.input_animation}>
          {animationValue.split('').map((c, i) => (
            <div key={i}>{c}</div>
          ))}
        </div>
      ) : (
        <input
          ref={ref}
          onChange={(v) => setIban(ibanify(v.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && checkValidity()}
          value={iban}
          placeholder={placeholder}
          type={'text'}
          autoFocus={autoFocus}
        />
      )}
      <input
        ref={ref}
        onChange={(v) => setBic(bicify(v.target.value))}
        onKeyDown={(e) => e.key === 'Enter' && checkValidity()}
        value={bic}
        placeholder={bicPlaceholder}
        type={'text'}
        autoFocus={autoFocus}
      />
      <Button className={styles.button} onClick={() => !loading && checkValidity()} disabled={loading}>
        {t(loading ? 'common:dashboard.iban.encrypting' : 'common:dashboard.iban.save')}
        {loading ? <Icons.Loader /> : <Icons.RightChevron />}
      </Button>
    </div>
  );
}

export default forwardRef(IbanInput);
