import styles from '../../styles/FeaturedDishes.module.css';

const dishes = [
  { title: 'Lahori Karahi', description: 'Rich spiced tomato karahi with fresh naan.', price: '₨1,750', rating: 4.9 },
  { title: 'Mutton Biryani', description: 'Slow-cooked biryani layered with saffron rice.', price: '₨1,890', rating: 4.8 },
  { title: 'Golden Seekh Kebab', description: 'Charred beef skewers with saffron glaze.', price: '₨1,250', rating: 4.7 },
];

function FeaturedDishes() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p>Iconic Favorites</p>
        <h2>Featured Dishes</h2>
      </div>
      <div className={styles.grid}>
        {dishes.map((dish) => (
          <div key={dish.title} className={styles.card}>
            <div className={styles.badge}>Chef&apos;s Pick</div>
            <h3>{dish.title}</h3>
            <p>{dish.description}</p>
            <div className={styles.meta}>
              <span>{dish.price}</span>
              <span>⭐ {dish.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedDishes;
