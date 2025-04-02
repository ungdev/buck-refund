'use client';
import { useState } from 'react';
import styles from './style.module.scss';
import { setPageParams, usePageSettings } from '@/module/pageSettings';
import { useAppTranslation } from '@/lib/i18n';
import Link from '@/components/UI/Link';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Icons from '@/icons';

export default function LoginPage() {
  usePageSettings({ hasNavbar: false, permissions: 'public', needsLoading: false });
  setPageParams({ title: 'Login' });
  const { t } = useAppTranslation();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = () => {
    setLoading(true);
    // Send the request to the API
    setLoading(false);
    setEmail('');
  };

  return (
    <div id="login-page" className={styles.loginPage}>
      <Input
        value={email}
        onChange={(v) => setEmail(v)}
        onEnter={submit}
        placeholder={t('common:magic_link.placeholder')}
        type="email"
      />
      <Button onClick={submit} className={styles.button} disabled={loading}>
        {loading ? (
          <>
            <Icons.Loader /> {t('common:login.loading')}
          </>
        ) : (
          t('common:magic_link.send')
        )}
      </Button>
      <div className={styles.bottomNotes}>
        <div>© 2025 UTT NET GROUP</div>
        <div>BuckUTT</div>
        <div>BDE UTT</div>
        <Link className={styles.bottomLink} href={'/legal'}>
          {t('common:legals')}
        </Link>
      </div>
    </div>
  );
}
