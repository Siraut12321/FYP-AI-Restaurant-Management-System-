import styles from '../../styles/Reviews.module.css';

const reviews = [
  { name: 'Ayesha Khan', quote: 'The AI experience feels magical — ordering was faster than ever.', score: 5 },
  { name: 'Omar Ali', quote: 'Luxury design and seamless navigation make this restaurant stand out.', score: 4.8 },
  { name: 'Sara Imran', quote: 'Perfect blend of modern UI and classic Urdu dining culture.', score: 4.9 },
];

function Reviews() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p>Trusted by Food Lovers</p>
        <h2>Customer Reviews</h2>
      </div>
      <div className={styles.reviewGrid}>
        {reviews.map((review) => (
          <div key={review.name} className={styles.card}>
            <p className={styles.quote}>&quot;{review.quote}&quot;</p>
            <div className={styles.footer}>
              <span>{review.name}</span>
              <span>⭐ {review.score}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Reviews;
