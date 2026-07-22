import { useEffect, useRef, useState } from 'react';
import api from '../../api/api';
import {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  toggleFeatured,
} from '../../services/menuService';
import styles from '../../styles/MenuManagement.module.css';

const EMPTY_FORM = {
  dishName: '',
  description: '',
  category: '',
  price: '',
  discountPrice: '',
  ingredients: '',
  preparationTime: '',
  isAvailable: true,
  isFeatured: false,
};

function MenuManagement() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);

  // modal state
  const [showAdd, setShowAdd]     = useState(false);
  const [editItem, setEditItem]   = useState(null); // item being edited

  // form state (shared for add & edit)
  const [form, setForm]           = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileRef = useRef();

  // ── Load items ──────────────────────────────────────────────────────────────
  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchMenuItems();
      setItems(res.data || []);
    } catch {
      setError('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Seed default menu ───────────────────────────────────────────────────────
  const [seeding, setSeeding] = useState(false);
  const handleSeed = async () => {
    if (!window.confirm('This will DELETE all existing menu items and insert the default 20 items. Continue?')) return;
    try {
      setSeeding(true);
      const { data } = await api.post('/dev/seed-menu');
      alert(`✅ ${data.message}`);
      load();
    } catch {
      alert('❌ Seed failed. Make sure the backend is running in development mode.');
    } finally {
      setSeeding(false);
    }
  };

  // ── Open Add modal ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setEditItem(null);
    setShowAdd(true);
  };

  // ── Open Edit modal ─────────────────────────────────────────────────────────
  const openEdit = (item) => {
    setForm({
      dishName:        item.dishName,
      description:     item.description,
      category:        item.category,
      price:           item.price,
      discountPrice:   item.discountPrice ?? '',
      ingredients:     (item.ingredients || []).join(', '),
      preparationTime: item.preparationTime ?? '',
      isAvailable:     item.isAvailable,
      isFeatured:      item.isFeatured,
    });
    setImageFile(null);
    setImagePreview(item.image);
    setEditItem(item);
    setShowAdd(true);
  };

  const closeModal = () => { setShowAdd(false); setEditItem(null); setError(''); };

  // ── Handle image pick ───────────────────────────────────────────────────────
  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Submit (add or update) ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editItem && !imageFile) { setError('Image is required.'); return; }

    const fd = new FormData();
    fd.append('dishName',        form.dishName);
    fd.append('description',     form.description);
    fd.append('category',        form.category);
    fd.append('price',           form.price);
    if (form.discountPrice !== '' && form.discountPrice != null)   fd.append('discountPrice',   form.discountPrice);
    if (form.preparationTime !== '' && form.preparationTime != null) fd.append('preparationTime', form.preparationTime);
    fd.append('isAvailable',  form.isAvailable);
    fd.append('isFeatured',   form.isFeatured);

    // ingredients as array
    form.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
      .forEach((ing) => fd.append('ingredients[]', ing));

    if (imageFile) fd.append('image', imageFile);

    try {
      setSaving(true);
      setError('');
      if (editItem) {
        await updateMenuItem(editItem._id, fd);
      } else {
        await createMenuItem(fd);
      }
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch {
      alert('Failed to delete item.');
    }
  };

  // ── Toggle helpers ──────────────────────────────────────────────────────────
  const handleToggleAvail = async (id) => {
    const res = await toggleAvailability(id);
    setItems((prev) => prev.map((i) => (i._id === id ? res.data : i)));
  };

  const handleToggleFeatured = async (id) => {
    const res = await toggleFeatured(id);
    setItems((prev) => prev.map((i) => (i._id === id ? res.data : i)));
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Restaurant</p>
          <h2 className={styles.title}>Menu Management</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className={styles.addBtn} style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--admin-text-muted)' }} onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Seeding…' : '🌱 Seed Default Menu'}
          </button>
          <button className={styles.addBtn} onClick={openAdd}>+ Add Item</button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p className={styles.info}>Loading…</p>
      ) : items.length === 0 ? (
        <p className={styles.info}>No menu items yet. Click "Add Item" to create one.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item._id} className={styles.card}>
              <div className={styles.imgWrap}>
                <img src={item.image} alt={item.dishName} className={styles.img} />
                <div className={styles.badges}>
                  {item.isFeatured  && <span className={styles.badgeFeatured}>Featured</span>}
                  {!item.isAvailable && <span className={styles.badgeUnavail}>Unavailable</span>}
                </div>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.category}>{item.category}</p>
                <h3 className={styles.dishName}>{item.dishName}</h3>
                <p className={styles.desc}>{item.description}</p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>₨{item.price}</span>
                  {item.discountPrice && (
                    <span className={styles.discount}>₨{item.discountPrice}</span>
                  )}
                </div>
                <div className={styles.actions}>
                  <button className={styles.editBtn}   onClick={() => openEdit(item)}>Edit</button>
                  <button className={styles.availBtn}  onClick={() => handleToggleAvail(item._id)}>
                    {item.isAvailable ? 'Disable' : 'Enable'}
                  </button>
                  <button className={styles.featBtn}   onClick={() => handleToggleFeatured(item._id)}>
                    {item.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(item._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showAdd && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Image */}
              <div className={styles.imageUpload} onClick={() => fileRef.current.click()}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className={styles.previewImg} />
                  : <span className={styles.uploadHint}>📷 Click to upload image</span>
                }
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImageChange} />
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Dish Name *</span>
                  <input required value={form.dishName} onChange={(e) => setForm((s) => ({ ...s, dishName: e.target.value }))} />
                </label>

                <label className={styles.field}>
                  <span>Category *</span>
                  <input required value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} />
                </label>

                <label className={styles.field}>
                  <span>Price (₨) *</span>
                  <input required type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} />
                </label>

                <label className={styles.field}>
                  <span>Discount Price (₨)</span>
                  <input type="number" min="0" step="0.01" value={form.discountPrice} onChange={(e) => setForm((s) => ({ ...s, discountPrice: e.target.value }))} />
                </label>

                <label className={styles.field}>
                  <span>Prep Time (mins)</span>
                  <input type="number" min="1" value={form.preparationTime} onChange={(e) => setForm((s) => ({ ...s, preparationTime: e.target.value }))} />
                </label>

                <label className={styles.field}>
                  <span>Ingredients (comma separated)</span>
                  <input value={form.ingredients} onChange={(e) => setForm((s) => ({ ...s, ingredients: e.target.value }))} />
                </label>

                <label className={`${styles.field} ${styles.fullWidth}`}>
                  <span>Description *</span>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
                </label>

                <div className={styles.checkRow}>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((s) => ({ ...s, isAvailable: e.target.checked }))} />
                    Available
                  </label>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((s) => ({ ...s, isFeatured: e.target.checked }))} />
                    Featured
                  </label>
                </div>
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving…' : editItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuManagement;
