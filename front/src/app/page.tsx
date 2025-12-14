'use client';

import styles from './style.module.scss';
import { useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { useAppTranslation } from '@/lib/i18n';
import { usePageSettings } from '@/module/pageSettings';
import { setIbanRegistered, useConnectedUser } from '@/module/user';
import { useAPI } from '@/api/api';
import { SetIbanRequestDto } from '@/api/user/setIban';
import { GetLockerResponseDto } from '@/api/user/getLocker';
import IbanInput, { IbanValidity } from '@/components/IbanInput';
import AppModal from '@/components/toplevel/AppModal';

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function importRsaKey(pemContents: string) {
  const binaryDerString = atob(pemContents);
  const binaryDer = str2ab(binaryDerString);
  return window.crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt'],
  );
}

async function encryptIban(iban: string, pemEncodedKey: string): Promise<string> {
  const key = await importRsaKey(pemEncodedKey);
  const buffer = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, Buffer.from(iban, 'utf-8'));
  return btoa(String.fromCodePoint(...new Uint8Array(buffer)));
}

const emojis = ['😴', '🫩', '👋', '🫰', '🫶', '🥱'];

export default function HomePage() {
  usePageSettings({ needsLoading: false });
  const { t } = useAppTranslation();
  const user = useConnectedUser();
  const dispatch = useAppDispatch();
  const api = useAPI();
  const [ibanErrorMessage, setIbanErrorMessage] = useState<string | null>(null);

  return (
    <AppModal>
      <div className={styles.title}>
        {t('common:dashboard.hi')} <span className={styles.bluePart}>{user?.firstName}</span>{' '}
        {emojis[Math.floor(Date.now() / (4 * 3_600_000)) % 6]}
      </div>
      <div className={user?.processed ? styles.processed : ''}>
        <div className={styles.balance}>
          {t('common:dashboard.balance')}
          <div className={styles.value}>
            {((user?.currentBalance ?? 0) / 100).toLocaleString('fr-FR', {
              currency: 'EUR',
              style: 'currency',
            })}
          </div>
          <div
            className={[styles.ibanRegistered, user?.paymentMethodRegistered ? styles.true : styles.false].join(' ')}>
            {user?.paymentMethodRegistered
              ? t('common:dashboard.iban.yes', {
                  last4: user.paymentMethodRegistered.iban,
                  bic: user.paymentMethodRegistered.bic,
                })
              : t('common:dashboard.iban.no')}
          </div>
        </div>
        {user?.eligible ? (
          <>
            <div className={[styles.info, user?.processed ? styles.processed : ''].filter((a) => a).join(' ')}>
              {user?.paymentMethodRegistered ? t('common:dashboard.info.update') : t('common:dashboard.info.line1')}
              <br />
              {t('common:dashboard.info.line2')}
            </div>
            {ibanErrorMessage !== null && (
              <div className={ibanErrorMessage === '' ? styles.accepted : styles.warn}>
                {ibanErrorMessage || t('common:dashboard.iban.saved')}
              </div>
            )}
            <IbanInput
              className={styles.iban}
              placeholder={t('common:dashboard.iban.placeholder')}
              bicPlaceholder={t('common:dashboard.bic.placeholder')}
              onEnter={async (valid, value, bic) => {
                if (valid === IbanValidity.INVALID) {
                  setIbanErrorMessage(t('common:dashboard.iban.error.invalid'));
                  return;
                }
                const lockerResponse = await api.post<never, GetLockerResponseDto>('/user/locker').toPromise();
                if (!lockerResponse) return setIbanErrorMessage(t('common:dashboard.iban.error.generic'));
                const data = await encryptIban(value, lockerResponse.data);
                dispatch((dispatch) =>
                  api
                    .put<SetIbanRequestDto, { errorCode?: number }>('/user/iban', { data, bic })
                    .on('success', async () => {
                      dispatch(setIbanRegistered(value, bic));
                      setIbanErrorMessage('');
                    })
                    .on(401, (body) =>
                      setIbanErrorMessage(
                        t(
                          body.errorCode === 2103
                            ? 'common:dashboard.iban.error.invalid'
                            : body.errorCode === 2104
                              ? 'common:dashboard.iban.error.balance_too_low'
                              : 'common:dashboard.iban.error.generic',
                        ),
                      ),
                    )
                    .on('error', () => setIbanErrorMessage(t('common:dashboard.iban.error.generic'))),
                );
              }}
            />
            <div className={styles.disclaimer}>
              <strong>{t('common:dashboard.disclaimer.bic')}</strong>
              <br />
              {t('common:dashboard.disclaimer')}
            </div>
          </>
        ) : (
          <div className={styles.warn}>
            <h2>{t('common:dashboard.not_eligible_line1')}</h2>
            {t('common:dashboard.not_eligible_line2')}
          </div>
        )}
      </div>
    </AppModal>
  );
}
