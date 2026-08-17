import styles from '../../styles/AboutPage.module.css';

function About() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p>Our Story</p>
        <h1>Modern Urdu Restaurant Hospitality with AI-Ready Magic</h1>
        <p>
          Hot & Spicy combines premium restaurant service with elegant technology-ready design, bringing local cuisine and intelligent ordering to a beautiful luxury interface.
        </p>
      </section>
      <div className={styles.section}>
        <div className={styles.sectionCard}>
          <h2>Mission</h2>
          <p>Deliver a seamless Urdu-first dining experience with a modern, voice-assisted restaurant platform designed for comfort, speed, and style.</p>
        </div>
        <div className={styles.sectionCard}>
          <h2>Vision</h2>
          <p>Create a future where restaurant ordering is as natural as speaking, with premium AI automation and delightful service for every guest.</p>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionCard}>
          <h2>Chef</h2>
          <p>Our chef blends tradition and innovation, crafting dishes that honor Urdu flavors while presenting them in a luxurious modern dining style.</p>
        </div>
      </div>
      <section className={styles.gallery}>
        <div className={styles.galleryItem}></div>
        <div className={styles.galleryItem}></div>
        <div className={styles.galleryItem}></div>
      </section>
    </div>
  );
}

export default About;
