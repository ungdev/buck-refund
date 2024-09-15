'use client';

import styles from './style.module.scss';
import { usePageSettings } from '@/module/pageSettings';

export default function HomePage() {
  usePageSettings({ needsLoading: false });

  return <div className={styles.page}>Work in progress... Come back later !</div>;
}
