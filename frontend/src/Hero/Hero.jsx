import styles from '../styles/Hero.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

function Hero() {
  const navigate = useNavigate();
  const handleTalkWithAI = useCallback(() => {
    // Navigate to home and scroll to the assistant section if necessary
    if (window.location.pathname === '/') {
      const el = document.getElementById('voice-assistant');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    navigate('/');
    // scroll shortly after navigation
    setTimeout(() => { const el = document.getElementById('voice-assistant'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 220);
  }, [navigate]);

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <p className={styles.subtitle}>Hot & Spicy — Premium Voice Dining</p>
          <h1>Order Instantly Using Natural Urdu Voice</h1>
          <p className={styles.description}>
            Enjoy a refined, voice-first dining experience: browse the menu, get helpful suggestions, and place orders — all by speaking naturally in Urdu.
          </p>
          <div className={styles.heroBadges}>
            <span>Voice-first ordering</span>
            <span>24/7 concierge</span>
            <span>Luxury dining</span>
          </div>
          <div className={styles.ctaGroup}>
            <Link to='/menu' className={styles.primary}>Order Now</Link>
            <button type="button" className={styles.secondary} onClick={handleTalkWithAI}>Talk with AI</button>
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
