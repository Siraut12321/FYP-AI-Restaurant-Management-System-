import { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import '../styles/CategorySelector.module.css';

function CategorySelector({ value, onChange, label = 'Category' }) {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/menu/categories');
        setCategories(data.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (category) => {
    onChange(category);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{
        display: 'block',
        color: '#a1a1aa',
        fontSize: '0.8rem',
        fontWeight: 600,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label} *
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: isOpen ? '1px solid var(--admin-gold)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '10px 12px',
          cursor: 'pointer',
          color: value ? '#ffffff' : '#71717a',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
        }}
      >
        <span>{value || 'Select a category...'}</span>
        <span style={{
          fontSize: '0.8rem',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}>
          ▼
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--admin-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            marginTop: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.02)',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '10px 12px',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.02)';
            }}
          />

          {/* Categories List */}
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {loading ? (
              <div style={{
                padding: '12px',
                color: '#71717a',
                fontSize: '0.85rem',
                textAlign: 'center',
              }}>
                Loading...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div style={{
                padding: '12px',
                color: '#71717a',
                fontSize: '0.85rem',
                textAlign: 'center',
              }}>
                No categories found
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category}
                  onClick={() => handleSelect(category)}
                  style={{
                    padding: '10px 12px',
                    background: value === category ? 'var(--admin-gold-dim)' : 'transparent',
                    color: value === category ? 'var(--admin-gold)' : '#a1a1aa',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.15s ease',
                    borderLeft: value === category ? '3px solid var(--admin-gold)' : '3px solid transparent',
                    paddingLeft: value === category ? '9px' : '12px',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== category) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.target.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== category) {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#a1a1aa';
                    }
                  }}
                >
                  {category}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CategorySelector;
