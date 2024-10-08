import styles from './Link.module.scss';
import { ReactNode } from 'react';
import ReactLink from 'next/link';
import { Url } from 'next/dist/shared/lib/router/router';

export default function Link({
  children,
  href,
  className = '',
  noStyle = false,
}: {
  children?: ReactNode;
  href: Url;
  className?: string;
  noStyle?: boolean;
}) {
  return (
    <ReactLink href={href} className={`${styles.link} ${className} ${noStyle ? styles.noStyle : ''}`}>
      <span>{children}</span>
    </ReactLink>
  );
}
