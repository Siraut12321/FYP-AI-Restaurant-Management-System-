import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MenuCard from '../../components/MenuCard/MenuCard';
import { getAllMenuItems } from '../../services/menuService';
import styles from '../../styles/MenuPage.module.css';

// Category emoji map — extend as needed
const CATEGORY_EMOJI = {
  bbq:        '🍖',
  biryani:    '🍚',
  grills:     '🔥',
  burgers:    '🍔',
  pizza:      '🍕',
  chinese:    '🥡',
  'fast food':'🍟',
  drinks:     '🥤',
  dessert:    '🍰',
  deals:      '🎁',
};

const getEmoji = (category) =>
  CATEGORY_EMOJI[category?.toLowerCase()] ?? '🍽️';

// Normalise a backend MenuItem to the shape MenuCard expects
const normalise = (item) => ({
  id:          item._id,
  name:        item.dishName,
  description: item.description,
  category:    item.category,
  price:       `PKR ${item.discountPrice || item.price}`,
  priceValue:  Number(item.discountPrice || item.price),
  rating:      item.rating ?? 4.7,
  image:       item.image,
  isAvailable: item.isAvailable,
});

function Menu() {
  const [allItems, setAllItems]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [sort, setSort]           = useState('rating');
  const [activeCategory, setActiveCategory] = useState('');
  const sectionRefs = useRef([]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    getAllMenuItems()
      .then((res) => {
        const items = (res.data || []).filter((i) => i.isAvailable !== false);
        setAllItems(items.map(normalise));
        if (items.length) setActiveCategory(items[0].category.toLowerCase().replace(/\s+/g, '-'));
      })
      .catch(() => setFetchError('Failed to load menu. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived nav / filter lists ─────────────────────────────────────────────
  const uniqueCategories = useMemo(() => {
    const seen = new Set();
    return allItems
      .map((i) => i.category)
      .filter((c) => { if (seen.has(c)) return false; seen.add(c); return true; });
  }, [allItems]);

  const navCategories = useMemo(() =>
    uniqueCategories.map((c) => ({
      id:    c.toLowerCase().replace(/\s+/g, '-'),
      label: c,
      icon:  getEmoji(c),
    })),
  [uniqueCategories]);

  const filterOptions = useMemo(() => ['All', ...uniqueCategories], [uniqueCategories]);

  // ── Sections (grouped + filtered + sorted) ─────────────────────────────────
  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = allItems.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      const matchesCategory = category === 'All' || item.category === category;
      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'price-low')  return a.priceValue - b.priceValue;
      if (sort === 'price-high') return b.priceValue - a.priceValue;
      if (sort === 'newest')     return b.id.localeCompare(a.id);
      return b.rating - a.rating;
    });

    // Group by category preserving sort order
    const map = new Map();
    sorted.forEach((item) => {
      const key = item.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });

    return Array.from(map.entries()).map(([title, items]) => ({
      id:    title.toLowerCase().replace(/\s+/g, '-'),
      title,
      emoji: getEmoji(title),
      items,
    }));
  }, [allItems, search, category, sort]);

  const totalItems   = allItems.length;
  const visibleItems = useMemo(
    () => filteredSections.reduce((sum, s) => sum + s.items.length, 0),
    [filteredSections],
  );

  // ── Intersection observer for sticky nav ──────────────────────────────────
  useEffect(() => {
    const sections = sectionRefs.current.filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveCategory(visible.target.id);
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.2, 0.4, 0.6] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [filteredSections]);

  const scrollToSection = (sectionId) => {
    setActiveCategory(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.heroGlow} />
        <div className={styles.floatingIconOne}>🍛</div>
        <div className={styles.floatingIconTwo}>🥙</div>
        <div className={styles.heroContent}>
          <div className={styles.heroIntro}>
            <p className={styles.eyebrow}>Signature restaurant menu</p>
            <h1>Fine dining favorites, crafted to impress.</h1>
            <p>Discover a curated menu of premium karahi, biryani, grills, burgers, pizza and indulgent desserts.</p>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.highlightCard}>
              <span className={styles.highlightBadge}>Chef's choice</span>
              <h3>Luxury flavors, served with warmth.</h3>
              <p>Every dish is prepared with bold spices, rich textures and a polished presentation that feels at home in a premium dining room.</p>
              <div className={styles.statsRow}>
                <div>
                  <strong>{uniqueCategories.length || '10'}+</strong>
                  <span>Signature sections</span>
                </div>
                <div>
                  <strong>4.9/5</strong>
                  <span>Guest rating</span>
                </div>
              </div>
            </div>

            <div className={styles.controls}>
              <input
                type="search"
                placeholder="Search dishes, flavors or categories"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {filterOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price Low to High</option>
                <option value="price-high">Price High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Sticky category nav — only when data is loaded */}
      {!loading && !fetchError && navCategories.length > 0 && (
        <div className={styles.categoryNav}>
          {navCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.categoryPill} ${activeCategory === cat.id ? styles.categoryPillActive : ''}`}
              onClick={() => scrollToSection(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.resultsBar}>
        <span>Showing {visibleItems} of {totalItems} dishes</span>
        {search ? <span>Filtered by "{search}"</span> : null}
      </div>

      {/* Loading */}
      {loading && (
        <div className={styles.emptyState}>
          <h3>Loading menu…</h3>
          <p>Fetching the latest dishes for you.</p>
        </div>
      )}

      {/* Error */}
      {!loading && fetchError && (
        <div className={styles.emptyState}>
          <h3>⚠️ Something went wrong</h3>
          <p>{fetchError}</p>
        </div>
      )}

      {/* Empty — backend returned no items */}
      {!loading && !fetchError && allItems.length === 0 && (
        <div className={styles.emptyState}>
          <h3>🍽️ Menu coming soon</h3>
          <p>No dishes have been added yet. Check back shortly.</p>
        </div>
      )}

      {/* No search results */}
      {!loading && !fetchError && allItems.length > 0 && filteredSections.length === 0 && (
        <div className={styles.emptyState}>
          <h3>No dishes match your search</h3>
          <p>Try a different keyword or switch to another category.</p>
        </div>
      )}

      {/* Menu sections */}
      {!loading && !fetchError && filteredSections.length > 0 && (
        <div className={styles.menuSections}>
          <AnimatePresence mode="wait">
            {filteredSections.map((section, index) => (
              <motion.section
                key={section.id}
                id={section.id}
                ref={(node) => { sectionRefs.current[index] = node; }}
                className={styles.section}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.sectionEyebrow}>{section.emoji} curated selection</p>
                    <h2>{section.title}</h2>
                  </div>
                  <span className={styles.sectionCount}>{section.items.length} dishes</span>
                </div>

                <div className={styles.cardGrid}>
                  {section.items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MenuCard item={item} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default Menu;
