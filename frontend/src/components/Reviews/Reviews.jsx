import { useEffect, useState } from 'react';
import styles from '../../styles/Reviews.module.css';
import { getAllMenuItems } from '../../services/menuService';
import reviewService from '../../services/reviewService';
import ReviewSection from './ReviewSection';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState('');

  useEffect(() => {
    let active = true;
    getAllMenuItems()
      .then(async (response) => {
        const items = (response.data || []).filter((item) => item.isAvailable !== false);
        if (active) {
          setMenuItems(items);
          setSelectedMenuItem(items[0]?._id || '');
        }
        const results = await Promise.all(items.map((item) => reviewService.getReviews(item._id).catch(() => null)));
        const realReviews = results.flatMap((result) => result?.reviews || []);
        if (active) setReviews(realReviews.slice(0, 6));
      })
      .catch(() => { if (active) setReviews([]); });
    return () => { active = false; };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p>Trusted by Food Lovers</p>
        <h2>Customer Reviews</h2>
      </div>
      {menuItems.length > 0 && (
        <div className={styles.writeReview}>
          <label htmlFor='home-review-dish'>Review a dish</label>
          <select
            id='home-review-dish'
            value={selectedMenuItem}
            onChange={(event) => setSelectedMenuItem(event.target.value)}
          >
            {menuItems.map((item) => (
              <option key={item._id} value={item._id}>{item.dishName}</option>
            ))}
          </select>
          {selectedMenuItem && <ReviewSection menuItemId={selectedMenuItem} />}
        </div>
      )}
      <div className={styles.reviewGrid}>
        {reviews.length === 0 && <p>No reviews yet.</p>}
        {reviews.map((review) => (
          <div key={review._id} className={styles.card}>
            <p className={styles.quote}>&quot;{review.comment}&quot;</p>
            <div className={styles.footer}>
              <span>{review.customer?.name || 'Customer'}</span>
              <span>⭐ {review.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Reviews;
