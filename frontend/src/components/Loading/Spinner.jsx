import styles from '../../styles/Spinner.module.css';

function Spinner() {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.spinner} />
    </div>
  );
}

export default Spinner;
