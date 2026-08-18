import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Spinner from '../../components/Loading/Spinner';
import profileService from '../../services/profileService';
import styles from '../../styles/ProfilePage.module.css';

const PHONE_RE = /^03[0-9]{9}$/;

const initialForm = { name: '', phone: '', address: '' };

const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
};

function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    let active = true;

    profileService.getProfile()
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.status === 401
          ? 'Your session has expired. Please log in again.'
          : err.response?.data?.message || 'Unable to load your profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    if (name === 'phone') {
      if (!/^[0-9]*$/.test(value) || value.length > 11) return;
      setPhoneError('');
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (form.phone && !PHONE_RE.test(form.phone)) {
      setPhoneError('Phone must be 11 digits starting with 03 (e.g. 03001234567)');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const updated = await profileService.updateProfile({ ...form, avatar });
      setProfile(updated);
      setAvatar(null);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.status === 401
        ? 'Your session has expired. Please log in again.'
        : err.response?.data?.message || 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  if (error && !profile) {
    return (
      <section className={styles.page}>
        <h1>My Profile</h1>
        <p role='alert'>{error}</p>
        <Link to='/login'>Log in</Link>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>My Profile</h1>
        <p>Manage your contact details and restaurant account information.</p>
      </header>

      <div className={styles.grid}>
        <aside className={styles.card}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              {profile.avatar ? (
                <img src={profile.avatar} alt={`${profile.name} profile`} />
              ) : (
                <span aria-hidden>{profile.name?.charAt(0)?.toUpperCase() || '?'}</span>
              )}
            </div>
            <div>
              <h2 className={styles.name}>{profile.name}</h2>
              <p className={styles.email}>{profile.email}</p>
              <div className={styles.stats}>
                <div className={styles.stat}><strong>{profile.totalOrders ?? 0}</strong><small>Total orders</small></div>
                <div className={styles.stat}><strong>{formatDate(profile.createdAt)}</strong><small>Joined</small></div>
              </div>
            </div>
          </div>
        </aside>

        <form onSubmit={submit} className={styles.card} encType='multipart/form-data'>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label>Name</label>
              <TextInput name='name' value={form.name} onChange={updateField} placeholder='Name' ariaLabel='Name' />
            </div>
            <div className={styles.formField}>
              <label>Phone</label>
              <TextInput name='phone' value={form.phone} onChange={updateField} placeholder='03XXXXXXXXX' ariaLabel='Phone' inputMode='numeric' />
              {phoneError && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: 4 }}>{phoneError}</div>}
            </div>
          </div>
          <div className={styles.formField}>
            <label>Address</label>
            <textarea name='address' value={form.address} onChange={updateField} rows='4' className={styles.input} />
          </div>
          <div className={styles.formField}>
            <label>Profile picture</label>
            <div>
              <input id='avatarUpload' type='file' accept='image/jpeg,image/png,image/webp' style={{ display: 'none' }} onChange={(event) => setAvatar(event.target.files?.[0] || null)} />
              <label htmlFor='avatarUpload' className={styles.uploadButton}>
                {avatar ? avatar.name : 'Choose image'}
              </label>
            </div>
          </div>
          {error && <p role='alert'>{error}</p>}
          {message && <p role='status'>{message}</p>}
          <div className={styles.buttonRow}>
            <Button type='submit' disabled={saving}>{saving ? 'Saving...' : 'Edit Profile'}</Button>
            <Link to='/orders'><Button type='button' variant='outline' className={styles.viewOrdersBtn}>View Orders</Button></Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Profile;
