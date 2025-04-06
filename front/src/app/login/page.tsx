'use client';
import styles from './style.module.scss';
import LoginForm from '@/components/auth/LoginForm';
import { setPageParams, usePageSettings } from '@/module/pageSettings';
import AppModal from '@/components/toplevel/AppModal';

export default function LoginPage() {
  usePageSettings({ hasNavbar: false, permissions: 'public', needsLoading: false });
  setPageParams({ title: 'Login' });

  return (
    <AppModal className={styles.noWidth}>
      <LoginForm />
    </AppModal>
  );
}
