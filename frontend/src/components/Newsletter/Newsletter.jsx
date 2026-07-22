import styles from '../../styles/Newsletter.module.css';

function Newsletter() {
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div>
          <p>Stay Updated</p>
          <h2>Newsletter</h2>
          <p>Subscribe for new deals, menu drops and AI dining updates.</p>
        </div>
        <form className={styles.form}>
          <input type='email' placeholder='Enter your email' aria-label='Email' />
          <button type='submit'>Subscribe</button>
        </form>
      </div>
    </section>
  );
}

export default Newsletter;
