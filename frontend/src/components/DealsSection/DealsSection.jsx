import styles from '../../styles/DealsSection.module.css';

const deals = [
  { title: 'Weekend Feast', description: '2 appetizers + 2 mains + dessert', price: '₨3,499' },
  { title: 'Family Combo', description: '4-person set with drinks included', price: '₨5,299' },
  { title: 'Midnight Snack', description: 'Spicy samosa platter with chutney', price: '₨999' },
];

function DealsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p>Limited Time Offers</p>
        <h2>Popular Deals</h2>
      </div>
      <div className={styles.cards}>
        {deals.map((deal) => (
          <div key={deal.title} className={styles.card}>
            <h3>{deal.title}</h3>
            <p>{deal.description}</p>
            <span>{deal.price}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DealsSection;
