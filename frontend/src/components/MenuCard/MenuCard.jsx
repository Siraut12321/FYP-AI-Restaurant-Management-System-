import { useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import styles from '../../styles/MenuCard.module.css';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import favoritesService from '../../services/favoritesService';
import ReviewSection from '../Reviews/ReviewSection';

function MenuCard({ item }) {
  const [favorite, setFavorite] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const detailsRef = useRef(null);
  const location = useLocation();
  const { addItem } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const safePrice = item.price || (typeof item.priceValue === 'number' ? `PKR ${item.priceValue}` : 'Price available');

  useEffect(() => {
    if (location.hash === `#review-${item.id}` && detailsRef.current) {
      detailsRef.current.open = true;
      detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [item.id, location.hash]);

  useEffect(() => {
    if (!user || !item.id) return undefined;
    let active = true;
    favoritesService.checkFavorite(item.id)
      .then(({ isFavorited }) => {
        if (active) setFavorite(isFavorited);
      })
      .catch(() => {})
      .finally(() => {});
    return () => { active = false; };
  }, [item.id, user]);

  async function toggleFavorite() {
    if (!user) {
      setFavoriteError('Please log in to save favorites.');
      return;
    }

    setFavoriteLoading(true);
    setFavoriteError('');
    try {
      if (favorite) {
        await favoritesService.removeFavorite(item.id);
        setFavorite(false);
      } else {
        await favoritesService.addFavorite(item.id);
        setFavorite(true);
      }
    } catch (err) {
      setFavoriteError(err.response?.data?.message || 'Unable to update favorite.');
    } finally {
      setFavoriteLoading(false);
    }
  }

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.25 }}
    >
      <div className={styles.imageWrap}>
        <div className={styles.categoryBadge}>{item.category}</div>
        {typeof item.rating === 'number' && (
          <div className={styles.ratingBadge}>
            <FaStar /> {item.rating.toFixed(1)}
          </div>
        )}
        {!imageLoaded && <div className={styles.imageSkeleton} />}
        {item.image ? (
          <img
            className={styles.image}
            src={item.image}
            alt={item.name}
            loading='lazy'
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className={styles.image} />
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.heading}>
          <h3>{item.name}</h3>
          <button type='button' onClick={toggleFavorite} className={styles.favorite} disabled={favoriteLoading} aria-label={favorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}>
            {favorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
        <p>{item.description}</p>
        {favoriteError && <p role='alert'>{favoriteError}</p>}
        <details ref={detailsRef} id={`review-${item.id}`}>
          <summary>Reviews</summary>
          <ReviewSection menuItemId={item.id} />
        </details>

        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span>{safePrice}</span>
            <div className={styles.qtyControl}>
              <button type='button' className={styles.qtyButton} onClick={() => setQty((prev) => Math.max(1, prev - 1))}>
                −
              </button>
              <span>{qty}</span>
              <button type='button' className={styles.qtyButton} onClick={() => setQty((prev) => prev + 1)}>
                +
              </button>
            </div>
          </div>
          <button type='button' className={styles.addButton} onClick={() => addItem(item, qty)}>
            Add to Cart
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default MenuCard;
