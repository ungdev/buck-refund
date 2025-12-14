'use client';

import styles from './style.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useAppTranslation } from '@/lib/i18n';
import { usePageSettings } from '@/module/pageSettings';
import { useConnectedUser } from '@/module/user';
import { API, useAPI } from '@/api/api';
import Input from '@/components/UI/Input';
import TextArea from '@/components/UI/TextArea';
import Button from '@/components/UI/Button';
import AppModal from '@/components/toplevel/AppModal';
import Icons from '@/icons';

// [12pm;4am[ 😴 [4am;8am[ 🫩 [8am;12pm[ 🤑 [12pm;4pm[ 😋 [4pm;8pm[ 😜 [8pm;12am[ 🥱
const emojis = ['😴', '🫩', '🤑', '😋', '😜', '🥱'];

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function importRsaKey(pemContents: string) {
  pemContents = pemContents.replaceAll(/-----[^-]+?-----|\n|\r/g, '');
  const binaryDerString = atob(pemContents);
  const binaryDer = str2ab(binaryDerString);
  return window.crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt'],
  );
}

async function decryptData(data: string, pemEncodedKey: string): Promise<string> {
  let key: CryptoKey;
  let buffer: ArrayBuffer;
  try {
    key = await importRsaKey(pemEncodedKey);
  } catch (e) {
    throw new AggregateError([e as Error], `[DEBUCK] Error importing RSA key: ${(e as Error).message}`);
  }
  try {
    buffer = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, base64ToArrayBuffer(data));
  } catch (e) {
    throw new AggregateError([e as Error], `[DEBUCK] Error decrypting data: ${(e as Error).message}`);
  }
  return String.fromCodePoint(...new Uint8Array(buffer));
}

type ConfigurationStatus = {
  debtor_iban: boolean;
  debtor_bic: boolean;
  debtor_name: boolean;
  debtor_address: boolean;
};

export default function AdminPage() {
  usePageSettings({ needsLoading: false });
  const { t } = useAppTranslation();
  const user = useConnectedUser();
  const api = useAPI();

  const [hasLoaded, setLoaded] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [debtorIban, setDebtorIban] = useState('');
  const [debtorBic, setDebtorBic] = useState('');
  const [debtorName, setDebtorName] = useState('');
  const [debtorAddr1, setDebtorAddr1] = useState('');
  const [debtorAddr2, setDebtorAddr2] = useState('');
  const [status, setStatus] = useState<ConfigurationStatus>({
    debtor_address: false,
    debtor_bic: false,
    debtor_iban: false,
    debtor_name: false,
  });
  const [error, setError] = useState('');
  const [hasSettingsOpen, setSettingsOpen] = useState(false);
  const downloadedData = useRef('');
  const [downloadedDataLink, setDownloadedDataLink] = useState('');

  useEffect(() => {
    if (!downloadedData.current) setDownloadedDataLink('');
    else {
      const blob = new Blob([downloadedData.current], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      setDownloadedDataLink(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [downloadedData.current]);

  useEffect(() => {
    api.get<ConfigurationStatus>('/admin/config').on('success', (data) => {
      setStatus(data);
      setLoaded(true);
      setSettingsOpen(Object.values(data).indexOf(false) >= 0);
    });
  }, []);

  const submitSettings = async () => {
    await api
      .patch(
        '/admin/config',
        Object.fromEntries(
          Object.entries({
            debtor_iban: debtorIban,
            debtor_bic: debtorBic,
            debtor_name: debtorName,
            debtor_address: [debtorAddr1, debtorAddr2],
          }).filter(([, v]) => (Array.isArray(v) ? v.every((v2) => !!v2) : !!v)),
        ),
      )
      .toPromise();
    api.get<ConfigurationStatus>('/admin/config').on('success', (data) => {
      setStatus(data);
      setLoaded(true);
      setSettingsOpen(Object.values(data).indexOf(false) >= 0);
    });
  };

  const parseReport = async (xml: string, privateKey: string) => {
    let xmlString = xml;
    const encrypted = xml.matchAll(/(?<=<(?<tag>[^<>]+?)>)[^<>]{100,}(?=<\/\k<tag>>)/g);
    try {
      for (const data of encrypted) {
        const realWorldData = await decryptData(data[0], privateKey);
        xmlString = xmlString.replaceAll(data[0], realWorldData);
      }
    } catch (e) {
      downloadedData.current = xml;
      setError(t('common:admin.error_decrypt'));
      console.error(e);
      return;
    }
    setError('');
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buckutt-report-${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadReport = async (api: API, privateKey: string) => {
    if (downloadedData.current) parseReport(downloadedData.current, privateKey);
    else
      api
        .get<string>('/admin/report', { isFile: true })
        .on('success', (xml) => parseReport(xml, privateKey))
        .on('error', ({ error }) => {
          setError(error);
        });
  };

  return (
    <AppModal>
      <div className={styles.title}>
        {t('common:dashboard.hi')}{' '}
        <span className={styles.bluePart}>
          <span className={styles.nope}>{user?.firstName}</span>
        </span>{' '}
        {emojis[Math.floor(Date.now() / (4 * 3_600_000)) % 6]}
      </div>
      {error ? (
        <div className={styles.warn}>
          {error === t('common:admin.error_decrypt')
            ? [
                error.slice(0, error.indexOf('.') + 2),
                <a href={downloadedDataLink} download={`buckutt-raw-${Date.now()}.xml`} key="link">
                  {error.slice(error.indexOf('.') + 2, error.indexOf('.', error.indexOf('.') + 1))}
                </a>,
                error.slice(error.indexOf('.', error.indexOf('.') + 1)),
              ]
            : error}
        </div>
      ) : (
        <></>
      )}
      {hasLoaded ? (
        hasSettingsOpen ? (
          <div className={styles.margin}>
            <Input
              className={[!status.debtor_name ? styles.required : '', styles.in].join(' ')}
              value={debtorName}
              placeholder={t('common:admin.placeholder_debtor_name')}
              onChange={setDebtorName}
            />
            <Input
              className={[!status.debtor_iban ? styles.required : '', styles.in].join(' ')}
              value={debtorIban}
              placeholder={t('common:admin.placeholder_debtor_iban')}
              onChange={setDebtorIban}
            />
            <Input
              className={[!status.debtor_bic ? styles.required : '', styles.in].join(' ')}
              value={debtorBic}
              placeholder={t('common:admin.placeholder_debtor_bic')}
              onChange={setDebtorBic}
            />
            <Input
              className={[!status.debtor_address ? styles.required : '', styles.in].join(' ')}
              value={debtorAddr1}
              placeholder={t('common:admin.placeholder_debtor_addr_1')}
              onChange={setDebtorAddr1}
            />
            <Input
              className={[!status.debtor_address ? styles.required : '', styles.in].join(' ')}
              value={debtorAddr2}
              placeholder={t('common:admin.placeholder_debtor_addr_2')}
              onChange={setDebtorAddr2}
            />
            <Button onClick={submitSettings}>{t('common:admin.placeholder_configure')}</Button>
          </div>
        ) : (
          <div className={styles.margin}>
            <TextArea
              placeholder={t('common:admin.private_key')}
              buttonText={t('common:admin.generate')}
              onChange={setPrivateKey}
              value={privateKey}
              onEnter={() => !!privateKey && downloadReport(api, privateKey)}
            />
            <Button className={styles.configure} onClick={() => setSettingsOpen(true)}>
              <Icons.CircleWarning />
              {t('common:admin.configure')}
            </Button>
          </div>
        )
      ) : (
        <div className={styles.loading}>{t('common:admin.loading')}</div>
      )}
    </AppModal>
  );
}
