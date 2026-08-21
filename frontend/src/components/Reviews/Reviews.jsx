import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../../styles/Reviews.module.css';
import { getAllMenuItems } from '../../services/menuService';
import reviewService from '../../services/reviewService';
import { AuthContext } from '../../context/AuthContext';
import { clearReviewDraft, loadReviewDraft, saveReviewDraft } from '../../services/reviewDraft';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ menuItem: '', rating: null, comment: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    getAllMenuItems()
      .then(async (response) => {
        const items = response.data || [];
        if (active) setItems(items);
        const results = await Promise.all(items.map((item) => reviewService.getReviews(item._id).catch(() => null)));
        const realReviews = results.flatMap((result) => result?.reviews || []);
        if (active) setReviews(realReviews.slice(0, 6));
      })
      .catch(() => { if (active) setReviews([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const draft = loadReviewDraft();
    if (draft?.scope === 'home') setForm({ menuItem: draft.menuItem || '', rating: draft.rating || null, comment: draft.comment || '' });
  }, [user]);

  async function submit(event) {
    event.preventDefault();
    setError(''); setMessage('');
    if (!form.rating) { setError('Please select a star rating before submitting your review.'); return; }
    if (!form.menuItem) { setError('Please select a dish to review.'); return; }
    if (!user) {
      saveReviewDraft({ scope: 'home', ...form });
      setError('Please log in to submit a review.');
      navigate('/login', { state: { returnTo: `${location.pathname}#customer-reviews` } });
      return;
    }
    setSaving(true);
    try {
      await reviewService.addReview({ menuItem: form.menuItem, rating: form.rating, comment: form.comment });
      const results = await Promise.all(items.map((item) => reviewService.getReviews(item._id).catch(() => null)));
      setReviews(results.flatMap((result) => result?.reviews || []).slice(0, 6));
      setForm({ menuItem: '', rating: null, comment: '' });
      clearReviewDraft();
      setMessage('Review submitted successfully.');
    } catch (err) { setError(err.response?.data?.message || 'Unable to submit your review.'); }
    finally { setSaving(false); }
  }

  return (
    <section className={styles.section} id='customer-reviews'>
      <div className={styles.header}>
        <p>Trusted by Food Lovers</p>
        <h2>Customer Reviews</h2>
      </div>
      <form className={styles.form} onSubmit={submit}>
        <label>Dish
          <select value={form.menuItem} onChange={(event) => setForm((current) => ({ ...current, menuItem: event.target.value }))}>
            <option value=''>Select a dish</option>
            {items.map((item) => <option key={item._id} value={item._id}>{item.dishName}</option>)}
          </select>
        </label>
        <label>Rating
          <div role='radiogroup' aria-label='Review rating'>
            {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type='button' aria-label={`${rating} stars`} aria-pressed={form.rating === rating} onClick={() => setForm((current) => ({ ...current, rating }))}>{rating <= (form.rating || 0) ? '★' : '☆'}</button>)}
          </div>
        </label>
        <label>Review (optional)<textarea value={form.comment} maxLength={1000} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} rows={3} /></label>
        {error && <p role='alert'>{error}</p>}
        {message && <p role='status'>{message}</p>}
        <button type='submit' disabled={saving}>{saving ? 'Submitting...' : 'Submit Review'}</button>
      </form>
      {reviews.length === 0 && <p>No reviews yet. Be the first to review a dish.</p>}
      <div className={styles.reviewGrid}>
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
