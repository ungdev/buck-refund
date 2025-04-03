'use client';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';
import { setPageParams, usePageSettings, useSearchParam } from '@/module/pageSettings';
import { useAppTranslation } from '@/lib/i18n';
import Link from '@/components/UI/Link';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Icons from '@/icons';
import { useAPI } from '@/api/api';
import { castMagic } from '@/module/session';
import { useAppDispatch } from '@/lib/hooks';

const enum PageState {
  READY = 'ready',
  LOADING = 'loading',
  ERROR = 'error',
  SENT = 'sent',
  LOGIN = 'login',
}

export default function LoginPage() {
  usePageSettings({ hasNavbar: false, permissions: 'public', needsLoading: false });
  setPageParams({ title: 'Login' });
  const api = useAPI();
  const { t } = useAppTranslation();
  const dispatch = useAppDispatch();

  const requestMagicLink = (email: string) =>
    new Promise((res) =>
      api
        .post<{ login: string }, void>('auth/magic', {
          login: email,
        })
        .on('success', () => res(true))
        .on('error', () => res(false)),
    );

  const urlSpell = useSearchParam('spell');
  const [email, setEmail] = useState('');
  const [state, setState] = useState(PageState.READY);

  const submit = async () => {
    setState(PageState.LOADING);
    // Send the request to the API
    const result = await requestMagicLink(email);
    setState(result ? PageState.SENT : PageState.ERROR);
    setEmail('');
  };

  useEffect(() => {
    // Consume urlSpell if it exists
    if (urlSpell) {
      setState(PageState.LOADING);
      dispatch(castMagic(api, urlSpell, (error) => setState(error ? PageState.ERROR : PageState.LOGIN)));
    }
  }, [urlSpell]);

  return (
    <div id="login-page" className={styles.loginPage}>
      <div className={styles.mod}>
        {state === PageState.LOGIN && (
          <>
            <h2>{t('common:login.magic.success')}</h2>
            <p>{t('common:login.magic.success.2')}</p>
          </>
        )}
        {state === PageState.SENT && (
          <>
            <h2>{t('common:login.magic.sent')}</h2>
            <p>{t('common:login.magic.sent.2')}</p>
          </>
        )}
        {state === PageState.ERROR && (
          <>
            <h2>{t('common:login.magic.error')}</h2>
            <p>{t('common:login.magic.error.2')}</p>
          </>
        )}
        {state === PageState.LOADING && (
          <>
            <h2>{t('common:login.loading')}</h2>
            <p>{t('common:login.loading.2')}</p>
            <Icons.Loader />
          </>
        )}
        {state === PageState.READY && (
          <>
            <h2>{t('common:login.magic.generate')}</h2>
            <Input
              value={email}
              onChange={(v) => setEmail(v)}
              onEnter={submit}
              placeholder={t('common:magic_link.placeholder')}
              type="email"
            />
            <Button onClick={submit} className={styles.button}>
              {t('common:magic_link.send')}
            </Button>
            <Link className={styles.bottomLink} href={'/login'}>
              {t('common:login.magic.undo')}
            </Link>
          </>
        )}
      </div>
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
