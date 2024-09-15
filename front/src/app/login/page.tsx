'use client';
import styles from './style.module.scss';
import LoginForm from '@/components/auth/LoginForm';
import { setPageParams, usePageSettings } from '@/module/pageSettings';
import { useAppTranslation } from '@/lib/i18n';
import Link from '@/components/UI/Link';

export default function LoginPage() {
  usePageSettings({ hasNavbar: false, permissions: 'public', needsLoading: false });
  setPageParams({ title: 'Login' });
  const { t } = useAppTranslation();

  return (
    <div id="login-page" className={styles.loginPage}>
      <LoginForm />
      <div className={styles.bottomNotes}>
        <div>© 2024 UTT NET GROUP</div>
        <div>BuckUTT</div>
        <div>BDE UTT</div>
        <Link className={styles.bottomLink} href={'/legal'}>
          {t('common:legals')}
        </Link>
      </div>
    </div>
  );
}
