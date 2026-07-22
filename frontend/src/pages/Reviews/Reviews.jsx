import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MdStar, MdReply, MdDelete, MdThumbUp, MdThumbDown, MdRemove } from 'react-icons/md';
import styles from './Reviews.module.css';

const MOCK_REVIEWS = [
  { id: 1, customer: 'Ali Khan',    initials: 'AK', rating: 5, dish: 'Mutton Biryani',  date: 'Jan 15, 2025', sentiment: 'positive', text: 'Absolutely amazing biryani! The spices were perfectly balanced and the meat was so tender. Will definitely order again.' },
  { id: 2, customer: 'Sara Ahmad',  initials: 'SA', rating: 4, dish: 'Seekh Kebab',     date: 'Jan 14, 2025', sentiment: 'positive', text: 'Really good kebabs, crispy on the outside and juicy inside. The chutney was a great complement.' },
  { id: 3, customer: 'Usman Raza',  initials: 'UR', rating: 3, dish: 'Lahori Karahi',   date: 'Jan 13, 2025', sentiment: 'neutral',  text: 'The karahi was decent but a bit too oily for my taste. The portion size was generous though.' },
  { id: 4, customer: 'Fatima Noor', initials: 'FN', rating: 5, dish: 'Mango Lassi',     date: 'Jan 12, 2025', sentiment: 'positive', text: 'Best mango lassi I have ever had! Thick, creamy and perfectly sweet. A must-try!' },
  { id: 5, customer: 'Hamza Malik', initials: 'HM', rating: 2, dish: 'Gulab Jamun',     date: 'Jan 11, 2025', sentiment: 'negative', text: 'The gulab jamun was too sweet and a bit dry. Expected better quality for the price.' },
  { id: 6, customer: 'Zara Sheikh', initials: 'ZS', rating: 5, dish: 'Mutton Biryani',  date: 'Jan 10, 2025', sentiment: 'positive', text: 'Ordered via the Urdu voice assistant — what an experience! Food was hot and fresh on delivery.' },
  { id: 7, customer: 'Omar Farooq', initials: 'OF', rating: 4, dish: 'Lahori Karahi',   date: 'Jan 09, 2025', sentiment: 'positive', text: 'Great flavour and authentic taste. The naan that came with it was perfectly soft.' },
  { id: 8, customer: 'Hina Baig',   initials: 'HB', rating: 1, dish: 'Seekh Kebab',     date: 'Jan 08, 2025', sentiment: 'negative', text: 'Very disappointed. The kebabs arrived cold and the order was missing items. Please improve delivery.' },
];

const FILTERS = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star', 'Positive', 'Negative'];

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.06, ease: 'easeOut' } }),
};

function StarRow({ rating }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <MdStar key={s} className={s <= rating ? styles.starFilled : styles.starEmpty} />
      ))}
    </div>
  );
}

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function Reviews() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [reviews, setReviews]           = useState(MOCK_REVIEWS);

  const filtered = useMemo(() => {
    if (activeFilter === 'All')      return reviews;
    if (activeFilter === 'Positive') return reviews.filter((r) => r.sentiment === 'positive');
    if (activeFilter === 'Negative') return reviews.filter((r) => r.sentiment === 'negative');
    const star = parseInt(activeFilter);
    return reviews.filter((r) => r.rating === star);
  }, [activeFilter, reviews]);

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const positive  = reviews.filter((r) => r.sentiment === 'positive').length;
  const negative  = reviews.filter((r) => r.sentiment === 'negative').length;

  function deleteReview(id) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  const SUMMARY = [
    { icon: '⭐', value: avgRating, label: 'Average Rating'   },
    { icon: '💬', value: reviews.length, label: 'Total Reviews' },
    { icon: '😊', value: positive,  label: 'Positive Reviews' },
    { icon: '😞', value: negative,  label: 'Negative Reviews' },
  ];

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Reviews</div>
          <div className={styles.pageSub}>Monitor customer feedback and manage responses.</div>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.summaryRow}>
        {SUMMARY.map((s, i) => (
          <motion.div
            key={s.label}
            className={styles.summaryCard}
            variants={fadeUp} initial="hidden" animate="visible" custom={i}
          >
            <div className={styles.summaryIcon}>{s.icon}</div>
            <div className={styles.summaryValue}>{s.value}</div>
            <div className={styles.summaryLabel}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${activeFilter === f ? styles.active : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reviews grid */}
      <div className={styles.grid}>
        {filtered.map((review, i) => (
          <motion.div
            key={review.id}
            className={styles.card}
            variants={fadeUp} initial="hidden" animate="visible" custom={i}
            layout
          >
            {/* Top row */}
            <div className={styles.cardTop}>
              <div className={styles.customerInfo}>
                <div className={styles.avatar}>{review.initials}</div>
                <div>
                  <div className={styles.customerName}>{review.customer}</div>
                  <div className={styles.reviewDate}>{review.date}</div>
                </div>
              </div>
              <span className={`${styles.sentiment} ${styles[review.sentiment]}`}>
                {review.sentiment === 'positive' && <MdThumbUp style={{ marginRight: 3 }} />}
                {review.sentiment === 'negative' && <MdThumbDown style={{ marginRight: 3 }} />}
                {review.sentiment === 'neutral'  && <MdRemove style={{ marginRight: 3 }} />}
                {review.sentiment}
              </span>
            </div>

            {/* Stars */}
            <StarRow rating={review.rating} />

            {/* Review text */}
            <p className={styles.reviewText}>{review.text}</p>

            {/* Dish tag */}
            <span className={styles.dishTag}>🍽️ {review.dish}</span>

            {/* Actions */}
            <div className={styles.cardActions}>
              <button className={styles.actionBtn}>
                <MdReply /> Reply
              </button>
              <button
                className={`${styles.actionBtn} ${styles.danger}`}
                onClick={() => deleteReview(review.id)}
              >
                <MdDelete /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Reviews;
