'use client';

import styles from './AuthForm.module.scss';
import { useState } from 'react';
import * as sessionModule from '@/module/session';
import { useAppDispatch } from '@/lib/hooks';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { useAPI } from '@/api/api';
import { useAppTranslation } from '@/lib/i18n';
import Icons from '@/icons';

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const api = useAPI();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const submit = () => dispatch(sessionModule.login(api, username, password));
  const { t } = useAppTranslation();
  const connectionText = t('common:login.connection');

  return (
    <div className={styles.authForm}>
      <Icons.LogoUNG className={styles.logo} />
      <div className={styles.title}>
        {connectionText.slice(0, (connectionText.length * 2) / 3)}
        <span className={styles.bluePart}>{connectionText.slice((connectionText.length * 2) / 3)}</span>
      </div>
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
      <Button onClick={submit} className={styles.button}>
        {t('common:login')}
      </Button>
    </div>
  );
}
