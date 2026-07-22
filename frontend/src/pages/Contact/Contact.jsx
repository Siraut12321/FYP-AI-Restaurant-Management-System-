import styles from '../../styles/ContactPage.module.css';

function Contact() {
  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h1>Contact Us</h1>
          <p>Reach out for reservations, private dining, or our latest AI-powered Urdu ordering experience.</p>
          <form className={styles.form}>
            <input type='text' placeholder='Your name' aria-label='Name' />
            <input type='email' placeholder='Your email' aria-label='Email' />
            <textarea rows='5' placeholder='Your message' aria-label='Message' />
            <button type='submit'>Send Message</button>
          </form>
        </div>
        <div className={styles.card}>
          <h2>Restaurant Information</h2>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <strong>Address</strong>
              <span>123 Urdu Avenue, Lahore, Pakistan</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Opening Hours</strong>
              <span>Mon - Sun: 12pm - 11pm</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Phone</strong>
              <span>+92 300 123 4567</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Email</strong>
              <span>hello@urduaibistro.com</span>
            </div>
          </div>
          <div className={styles.socialLinks}>
            <a href='#'>Instagram</a>
            <a href='#'>Facebook</a>
            <a href='#'>WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
