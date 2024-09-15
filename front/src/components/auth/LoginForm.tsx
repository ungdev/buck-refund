'use client';

import styles from './AuthForm.module.scss';
import buckuttLogo from '../../../public/assets/buckutt.webp';
import { useState } from 'react';
import * as sessionModule from '@/module/session';
import { useAppDispatch } from '@/lib/hooks';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { useAPI } from '@/api/api';
import { useAppTranslation } from '@/lib/i18n';
import Tooltip from '../UI/Tooltip';
import Icons from '@/icons';

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const api = useAPI();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = () => {
    setLoading(true);
    dispatch(
      sessionModule.login(api, username, password, (error) => {
        setLoading(false);
        if (error === 3004) {
          setError(t('common:login.fail.creds'));
        } else {
          setError(t('common:login.fail.other'));
        }
      }),
    );
  };
  const { t } = useAppTranslation();
  const connectionText = t('common:login.connection');

  return (
    <div className={styles.authForm}>
      <img src={buckuttLogo.src} alt={'BuckUTT Logo'} className={styles.logo} />
      <Tooltip
        content={() => (
          <>
            {t('common:login.explanation.line1')}
            <br />
            {t('common:login.explanation.line2')}
          </>
        )}>
        <div className={styles.title}>
          {connectionText.slice(0, (connectionText.length * 2) / 3)}
          <span className={styles.bluePart}>{connectionText.slice((connectionText.length * 2) / 3)}</span>
        </div>
      </Tooltip>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.inputContainer}>
        <Input value={username} onChange={(v) => setUsername(v)} onEnter={submit} placeholder={t('common:email')} />
        <Input
          value={password}
          onChange={(v) => setPassword(v)}
          onEnter={submit}
          placeholder={t('common:pwd')}
          type="password"
        />
      </div>
      <Button onClick={submit} className={styles.button} disabled={loading}>
        {loading ? (
          <>
            <Icons.Loader /> {t('common:login.loading')}
          </>
        ) : (
          t('common:login')
        )}
      </Button>
    </div>
  );
}
