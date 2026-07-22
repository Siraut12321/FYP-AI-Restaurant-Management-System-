import { useEffect, useState } from 'react';
import styles from '../../styles/DealsSection.module.css';
import MenuCard from '../../components/MenuCard/MenuCard';

// Use online images for deals to improve visuals
const placeholderDeals = [
  {
    id: 'deal-1',
    name: 'Weekend Feast',
    description: '2 appetizers + 2 mains + dessert',
    price: '₨3,499',
    priceValue: 3499,
    rating: 4.8,
    category: 'Combo',
    image: 'https://source.unsplash.com/800x600/?biryani,platter',
  },
  {
    id: 'deal-2',
    name: 'Family Combo',
    description: '4-person set with drinks included',
    price: '₨5,299',
    priceValue: 5299,
    rating: 4.9,
    category: 'Family',
    image: 'https://source.unsplash.com/800x600/?curry,feast',
  },
  {
    id: 'deal-3',
    name: 'Kebab Platter',
    description: 'Mixed seekh + chutney + naan',
    price: '₨1,299',
    priceValue: 1299,
    rating: 4.7,
    category: 'Grill',
    image: 'https://source.unsplash.com/800x600/?kebab,platter',
  },
];

function Deals() {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    // simulate fetch
    const t = setTimeout(() => setDeals(placeholderDeals), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <main style={{ padding: '48px 24px', minHeight: '72vh' }}>
      <div className={styles.header}>
        <p>Limited Time Offers</p>
        <h2>Deals & Special Combos</h2>
      </div>

      <div className={styles.cards}>
        {deals.map((d) => (
          <MenuCard key={d.id} item={d} />
        ))}
      </div>
    </main>
  );
}

export default Deals;
