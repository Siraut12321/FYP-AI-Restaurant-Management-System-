import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MdStar, MdReply, MdDelete, MdThumbUp, MdThumbDown, MdRemove } from 'react-icons/md';
import api from '../../api/api';
import styles from './Reviews.module.css';

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

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function Reviews() {
  const [reviews, setReviews]       = useState([]);
  const [summary, setSummary]       = useState({ totalReviews: 0, averageRating: 0, positive: 0, negative: 0 });
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    api.get('/admin/reviews')
      .then(({ data }) => {
        setReviews(data.data.reviews || []);
        setSummary(data.data.summary || { totalReviews: 0, averageRating: 0, positive: 0, negative: 0 });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load reviews.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === 'All')      return reviews;
    if (activeFilter === 'Positive') return reviews.filter((r) => r.sentiment === 'positive');
    if (activeFilter === 'Negative') return reviews.filter((r) => r.sentiment === 'negative');
    const star = parseInt(activeFilter);
    return reviews.filter((r) => r.rating === star);
  }, [activeFilter, reviews]);

  function deleteReview(id) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  const SUMMARY = [
    { icon: '⭐', value: summary.averageRating || 0, label: 'Average Rating'   },
    { icon: '💬', value: summary.totalReviews  || 0, label: 'Total Reviews'    },
    { icon: '😊', value: summary.positive      || 0, label: 'Positive Reviews' },
    { icon: '😞', value: summary.negative      || 0, label: 'Negative Reviews' },
  ];

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#a1a1aa' }}>
        Loading reviews…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--admin-danger)' }}>
        {error}
      </div>
    );
  }

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
      {filtered.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#71717a', fontSize: '0.875rem' }}>
          No customer reviews yet.
        </div>
      ) : (
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
                  <div className={styles.avatar}>{getInitials(review.customer)}</div>
                  <div>
                    <div className={styles.customerName}>{review.customer}</div>
                    <div className={styles.reviewDate}>
                      {new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
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
              <p className={styles.reviewText}>{review.comment}</p>

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
      )}
    </div>
  );
}

export default Reviews;
