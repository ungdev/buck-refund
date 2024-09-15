'use client';
import styles from './Wrapper.module.scss';
import React, { ReactNode } from 'react';
import { usePageSettings } from '@/module/pageSettings';
import Loader from '@/components/toplevel/Loader';

export default function Wrapper({ children }: { children: ReactNode }) {
  const { loaded, internallyLoaded } = usePageSettings();
  return (
    <>
      {(!loaded || !internallyLoaded) && <Loader />}
      <div className={styles.page}>{children}</div>
    </>
  );
}
