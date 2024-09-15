'use client';

import { useAppTranslation } from '@/lib/i18n';
import styles from './style.module.scss';
import { usePageSettings } from '@/module/pageSettings';
import { setIbanRegistered, useConnectedUser } from '@/module/user';
import IbanInput, { IbanValidity } from '@/components/IbanInput';
import Link from '@/components/UI/Link';
import { useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { useAPI } from '@/api/api';
import { SetIbanRequestDto } from '@/api/user/setIban';

export default function HomePage() {
  usePageSettings({ needsLoading: false });
  const { t } = useAppTranslation();
  const user = useConnectedUser();
  const dispatch = useAppDispatch();
  const api = useAPI();
  const [ibanErrorMessage, setIbanErrorMessage] = useState<string | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.mod}>
        <div className={styles.title}>
          {t('common:dashboard.hi')} <span className={styles.bluePart}>{user?.firstName}</span> 👋
        </div>
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
            {user?.paymentMethodRegistered ? t('common:dashboard.iban.yes') : t('common:dashboard.iban.no')}
          </div>
        </div>
        {(user?.currentBalance ?? 0) > 0 ? (
          <>
            <div className={styles.info}>
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
              onEnter={(valid, value) => {
                if (valid === IbanValidity.INVALID) {
                  setIbanErrorMessage(t('common:dashboard.iban.error.invalid'));
                  return;
                }
                dispatch((dispatch) =>
                  api
                    .put<SetIbanRequestDto, { errorCode?: number }>('/user/iban', {
                      data: value,
                    })
                    .on('success', async () => {
                      dispatch(setIbanRegistered());
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
            <div className={styles.disclaimer}>{t('common:dashboard.disclaimer')}</div>
          </>
        ) : (
          <div className={styles.warn}>{t('common:dashboard.balanceTooLow')}</div>
        )}
      </div>
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
