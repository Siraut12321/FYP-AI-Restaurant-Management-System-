import styles from '../../styles/WhyChooseUs.module.css';

const reasons = [
  { title: 'Urdu First Experience', body: 'Speak natively in Urdu and follow a menu designed for your cultural taste and comfort.', icon: '🗣️' },
  { title: 'Luxury Speed', body: 'Premium ordering flow with fast AI-inspired UI and high-end visual polish.', icon: '⚡' },
  { title: 'Smart Service', body: 'Intelligent dining assistant layout ready for voice automation and future AI expansions.', icon: '🤖' },
];

function WhyChooseUs() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <p>Elevated Dining</p>
        <h2>Why Choose Us</h2>
      </div>
      <div className={styles.grid}>
        {reasons.map((reason) => (
          <div key={reason.title} className={styles.card}>
            <div className={styles.icon}>{reason.icon}</div>
            <h3>{reason.title}</h3>
            <p>{reason.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WhyChooseUs;
