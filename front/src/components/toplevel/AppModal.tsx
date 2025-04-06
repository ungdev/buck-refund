import styles from './AppModal.module.scss';
import Link from '@/components/UI/Link';
import { useAppTranslation } from '@/lib/i18n';
import { useRef, type ReactNode } from 'react';

export default function AppModal({ children, className }: { children: ReactNode; className?: string }) {
  const { t } = useAppTranslation();
  const countRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    countRef.current += 1;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (countRef.current < 5) {
      timeoutRef.current = setTimeout(() => {
        countRef.current = 0;
      }, 1000);
    } else {
      document.body.setAttribute('data-theme', document.body.getAttribute('data-theme') === 'x' ? 't' : 'x');
    }
  };

  return (
    <div className={styles.page}>
      <div className={[styles.mod, className].filter((c) => c).join(' ')}>{children}</div>
      <div className={styles.bottomNotes} onClick={handleClick}>
        <div>© 2025 UTT NET GROUP</div>
        <div>BuckUTT</div>
        <div>BDE UTT</div>
        <Link href={'/legal'}>{t('common:legals')}</Link>
      </div>
    </div>
  );
}
