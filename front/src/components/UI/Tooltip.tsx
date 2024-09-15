import styles from './Tooltip.module.scss';
import { FC, ReactNode } from 'react';

export default function Tooltip({
  children = false,
  className = '',
  content: Content = () => <></>,
}: {
  className?: string | string[];
  content: FC;
  children: ReactNode;
}) {
  return (
    <div className={[styles.tooltipContainer, className].flat().join(' ')}>
      {children}
      <div className={styles.tooltip}>
        <Content />
      </div>
    </div>
  );
}
