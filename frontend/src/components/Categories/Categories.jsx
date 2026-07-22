import styles from '../../styles/Categories.module.css';

const categories = ['Karahi', 'Biryani', 'Grills', 'Desserts', 'Beverages'];

function Categories() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <p>Choose Your Flavor</p>
        <h2>Food Categories</h2>
      </div>
      <div className={styles.list}>
        {categories.map((category) => (
          <div key={category} className={styles.categoryCard}>
            <span>{category}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
