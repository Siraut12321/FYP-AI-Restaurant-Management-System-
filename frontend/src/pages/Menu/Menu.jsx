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

const toCategoryKey = (value = '') => value.toString().trim().toLowerCase();

const createCategoryId = (value = '') => {
  const normalized = toCategoryKey(value)
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'category';
};

const createUniqueId = (value, usedIds = new Set()) => {
  const baseId = createCategoryId(value);
  let id = baseId;
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  return id;
};

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
  const sectionRefs = useRef({});
  const lastActionWasClickRef = useRef(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    getAllMenuItems()
      .then((res) => {
        const items = (res.data || []).filter((i) => i.isAvailable !== false);
        setAllItems(items.map(normalise));
        if (items.length) setActiveCategory(createCategoryId(items[0].category));
      })
      .catch(() => setFetchError('Failed to load menu. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived nav / filter lists ─────────────────────────────────────────────
  const uniqueCategories = useMemo(() => {
    const seen = new Set();
    return allItems
      .map((i) => i.category)
      .filter((c) => {
        const key = toCategoryKey(c);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [allItems]);

  const navCategories = useMemo(() =>
    uniqueCategories.map((c) => ({
      id:    createCategoryId(c),
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

    // Group by category preserving sort order while normalising case-insensitive duplicates
    const grouped = new Map();
    sorted.forEach((item) => {
      const key = toCategoryKey(item.category);
      if (!grouped.has(key)) {
        grouped.set(key, { title: item.category, items: [] });
      }
      grouped.get(key).items.push(item);
    });

    const sectionIds = new Set();
    return Array.from(grouped.values()).map(({ title, items }) => ({
      id:    createUniqueId(title, sectionIds),
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
    // Build a current list of section nodes from the id->node map
    const nodes = Object.values(sectionRefs.current).filter(Boolean);
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the most visible intersecting entry
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible && visible.target && visible.target.id) {
          setActiveCategory(visible.target.id);
        }
      },
      { rootMargin: '-20% 0px -45% 0px', threshold: [0.2, 0.4, 0.6] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [filteredSections]);

  // Auto-scroll the active category pill into view inside the horizontal nav (mobile/tablet)
  useEffect(() => {
    try {
      // Only auto-scroll the pill when the user clicked a category (not while manually scrolling)
      if (!activeCategory || !lastActionWasClickRef.current) return;
      const sel = `[data-cat-id="${activeCategory}"]`;
      const btn = document.querySelector(sel);
      if (btn && btn.scrollIntoView) btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      // reset the flag after we've performed the pill scroll
      lastActionWasClickRef.current = false;
    } catch (e) {}
  }, [activeCategory]);

  const scrollToSection = (sectionId) => {
    // mark that this scroll was initiated by a click so the nav pill may auto-scroll
    lastActionWasClickRef.current = true;
    // clear the flag after a short time to avoid interfering with manual scroll updates
    setTimeout(() => { lastActionWasClickRef.current = false; }, 1000);
    // If the target section isn't mounted (for example because a filter is active),
    // reset the filter to 'All' so all sections are rendered, then scroll after render.
    const el = sectionRefs.current[sectionId] || document.getElementById(sectionId);

    const doScroll = (target) => {
      if (!target) return;
      try {
        setActiveCategory(sectionId);
        // Use native smooth scroll; CSS uses scroll-margin-top on .section to account for sticky nav
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) {
        // fallback
        window.scrollTo({ top: target.offsetTop - 120, behavior: 'smooth' });
      }
    };

    if (el) {
      doScroll(el);
      return;
    }

    // If not found, show all categories and try again on next frame
    if (category !== 'All') {
      setCategory('All');
      // wait for DOM update, then scroll
      setTimeout(() => {
        const target = sectionRefs.current[sectionId] || document.getElementById(sectionId);
        doScroll(target);
      }, 80);
    }
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
                aria-label="Search menu"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {filterOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <select aria-label="Sort menu" value={sort} onChange={(e) => setSort(e.target.value)}>
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
              data-cat-id={cat.id}
              className={`${styles.categoryPill} ${activeCategory === cat.id ? styles.categoryPillActive : ''}`}
              onClick={() => scrollToSection(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Auto-scroll active category pill into view for small screens (handled in effect) */}

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
          <AnimatePresence mode="popLayout">
              {filteredSections.map((section, index) => (
              <motion.section
                key={section.id}
                id={section.id}
                ref={(node) => { if (node) sectionRefs.current[section.id] = node; else delete sectionRefs.current[section.id]; }}
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
