import styles from '../styles/Hero.module.css';

function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <p className={styles.subtitle}>Premium Urdu Voice Restaurant Assistant</p>
          <h1>Order Your Favorite Food Simply by Talking in Urdu</h1>
          <p className={styles.description}>
            Experience a luxury AI dining experience with instant menu browsing, voice-led order flow, and restaurant automation.
          </p>
          <div className={styles.heroBadges}>
            <span>Voice-first ordering</span>
            <span>24/7 concierge</span>
            <span>Luxury dining</span>
          </div>
          <div className={styles.ctaGroup}>
            <button className={styles.primary}>Order Now</button>
            <button className={styles.secondary}>Talk with AI</button>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.visualGlow} />
          <div className={styles.visualCard}>
            <p className={styles.visualLabel}>Live concierge</p>
            <h3>AI Voice Dining</h3>
            <p>“آئیے آپ کے پسندیدہ کھانے کا آرڈر سنا دیا جائے”</p>
            <div className={styles.statRow}>
              <div>
                <strong>98%</strong>
                <span>Response rate</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>Guest rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
