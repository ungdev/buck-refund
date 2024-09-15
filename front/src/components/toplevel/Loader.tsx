import styles from './Loader.module.scss';
import Icons from '@/icons';

export default function Loader() {
  return (
    <div className={styles.loader}>
      <Icons.LogoUNG className={styles.icon} />
    </div>
  );
}
