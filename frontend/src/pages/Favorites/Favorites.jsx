import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../../components/Loading/Spinner';
import favoritesService from '../../services/favoritesService';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    favoritesService.getFavorites()
      .then((data) => {
        if (active) setFavorites(data || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.status === 401
          ? 'Your session has expired. Please log in again.'
          : err.response?.data?.message || 'Unable to load your favorite dishes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  async function removeFavorite(menuId) {
    setRemovingId(menuId);
    setError('');
    setMessage('');

    try {
      await favoritesService.removeFavorite(menuId);
      setFavorites((current) => current.filter(({ menuItem }) => menuItem?._id !== menuId));
      setMessage('Favorite removed.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove this favorite.');
    } finally {
      setRemovingId('');
    }
  }

  if (loading) return <Spinner />;

  if (error && favorites.length === 0) {
    return (
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>
        <h1>Favorite Dishes</h1>
        <p role='alert'>{error}</p>
        <Link to='/login'>Log in</Link>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 20px' }}>
      <header style={{ marginBottom: 28 }}>
        <h1>Favorite Dishes</h1>
        <p>Your saved dishes are ready whenever you are.</p>
      </header>

      {error && <p role='alert'>{error}</p>}
      {message && <p role='status'>{message}</p>}

      {favorites.length === 0 ? (
        <div>
          <h2>No favorite dishes yet</h2>
          <p>Save dishes from the menu to find them here.</p>
          <Link to='/menu'>Browse the menu</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {favorites.map(({ menuItem }) => {
            if (!menuItem) return null;
            const price = menuItem.discountPrice ?? menuItem.price;
            return (
              <article key={menuItem._id} style={{ border: '1px solid #ddd', padding: 16 }}>
                <img src={menuItem.image} alt={menuItem.dishName} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover' }} />
                <h2>{menuItem.dishName}</h2>
                <p>{menuItem.category}</p>
                <p>Price: {price}</p>
                <p>{menuItem.isAvailable ? 'Available' : 'Currently unavailable'}</p>
                <button type='button' onClick={() => removeFavorite(menuItem._id)} disabled={removingId === menuItem._id} aria-label={`Remove ${menuItem.dishName} from favorites`}>
                  {removingId === menuItem._id ? 'Removing...' : '♥ Remove favorite'}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Favorites;
