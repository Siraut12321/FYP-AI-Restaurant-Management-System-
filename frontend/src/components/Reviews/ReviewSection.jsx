import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';

const emptyForm = { rating: 5, comment: '' };

function ReviewSection({ menuItemId }) {
  const { user } = useContext(AuthContext);
  const [result, setResult] = useState({ reviews: [], summary: { averageRating: 0, totalReviews: 0 } });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    reviewService.getReviews(menuItemId)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Unable to load reviews.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [menuItemId]);

  function startEditing(review) {
    setEditingId(review._id);
    setForm({ rating: review.rating, comment: review.comment });
    setError('');
    setMessage('');
  }

  function resetForm() {
    setEditingId('');
    setForm(emptyForm);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (editingId) {
        const updated = await reviewService.updateReview(editingId, form);
        setResult((current) => ({
          ...current,
          reviews: current.reviews.map((review) => review._id === updated._id ? { ...review, ...updated, customer: review.customer } : review),
        }));
        setMessage('Review updated successfully.');
      } else {
        const created = await reviewService.addReview({ menuItem: menuItemId, ...form });
        setResult((current) => ({
          ...current,
          reviews: [{ ...created, customer: user }, ...current.reviews],
          summary: {
            ...current.summary,
            totalReviews: current.summary.totalReviews + 1,
          },
        }));
        setMessage('Review added successfully.');
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save your review.');
    } finally {
      setSaving(false);
    }
  }

  async function removeReview(reviewId) {
    setError('');
    setMessage('');
    try {
      await reviewService.deleteReview(reviewId);
      setResult((current) => ({
        ...current,
        reviews: current.reviews.filter((review) => review._id !== reviewId),
        summary: { ...current.summary, totalReviews: Math.max(0, current.summary.totalReviews - 1) },
      }));
      setMessage('Review deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete your review.');
    }
  }

  if (loading) return <p>Loading reviews...</p>;

  return (
    <section aria-labelledby={`reviews-${menuItemId}`}>
      <h3 id={`reviews-${menuItemId}`}>Customer Reviews</h3>
      <p>
        <strong>{Number(result.summary.averageRating || 0).toFixed(1)} / 5</strong>{' '}
        ({result.summary.totalReviews} reviews)
      </p>

      {error && <p role='alert'>{error}</p>}
      {message && <p role='status'>{message}</p>}

      {user && (
        <form onSubmit={submit}>
          <label>
            Rating
            <select value={form.rating} onChange={(event) => setForm((current) => ({ ...current, rating: Number(event.target.value) }))}>
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
            </select>
          </label>
          <label>
            Comment
            <textarea value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} maxLength={1000} required rows={3} />
          </label>
          <button type='submit' disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Review' : 'Write Review'}</button>
          {editingId && <button type='button' onClick={resetForm}>Cancel</button>}
        </form>
      )}

      {result.reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div>
          {result.reviews.map((review) => {
            const isOwner = user && review.customer?._id === user._id;
            return (
              <article key={review._id}>
                <strong>{review.customer?.name || 'Customer'}</strong>
                <p>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                <p>{review.comment}</p>
                {isOwner && (
                  <div>
                    <button type='button' onClick={() => startEditing(review)}>Edit</button>
                    <button type='button' onClick={() => removeReview(review._id)}>Delete</button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ReviewSection;
