import { useEffect, useState } from 'react';
import styles from '../../styles/FeaturedDishes.module.css';
import { getAllMenuItems } from '../../services/menuService';

function FeaturedDishes() {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    let active = true;
    getAllMenuItems()
      .then((response) => {
        const items = response.data || [];
        if (active) setDishes(items.filter((item) => item.isFeatured && item.isAvailable !== false).slice(0, 3));
      })
      .catch(() => { if (active) setDishes([]); });
    return () => { active = false; };
  }, []);

  if (dishes.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p>Iconic Favorites</p>
        <h2>Featured Dishes</h2>
      </div>
      <div className={styles.grid}>
        {dishes.map((dish) => (
          <div key={dish._id} className={styles.card}>
              {dish.image
                ? <img src={dish.image} alt={dish.dishName} className={styles.image} />
                : <div className={styles.imageFallback} aria-hidden="true" />}
            <div className={styles.badge}>Chef&apos;s Pick</div>
            <h3>{dish.dishName}</h3>
            <p>{dish.description}</p>
            <div className={styles.meta}>
              <span>PKR {dish.discountPrice || dish.price}</span>
              <span>{dish.category}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedDishes;
