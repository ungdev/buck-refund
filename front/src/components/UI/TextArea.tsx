import styles from './TextArea.module.scss';
import { FC, forwardRef } from 'react';
import Button from '@/components/UI/Button';

function TextArea({
  className = '',
  onChange = () => {},
  onEnter = () => {},
  value,
  placeholder,
  autoFocus = false,
  icon: Icon,
  buttonText,
}: {
  className?: string;
  onChange?: (v: string) => void;
  onEnter?: () => void;
  value?: string;
  placeholder?: string;
  autoFocus?: boolean;
  icon?: FC;
  buttonText?: string;
}) {
  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      <textarea
        onChange={(v) => onChange(v.target.value)}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {(Icon || buttonText) && (
        <Button noStyle className={styles.inline_validate} onClick={() => onEnter()} noTab>
          {Icon && <Icon />} {buttonText}
        </Button>
      )}
    </div>
  );
}

export default forwardRef(TextArea);
