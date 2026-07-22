import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Spinner from '../../components/Loading/Spinner';
import profileService from '../../services/profileService';

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
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
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
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px' }}>
        <h1>My Profile</h1>
        <p role='alert'>{error}</p>
        <Link to='/login'>Log in</Link>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>
      <header style={{ marginBottom: 28 }}>
        <h1>My Profile</h1>
        <p>Manage your contact details and restaurant account information.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 0.8fr) minmax(280px, 1.2fr)', gap: 28 }}>
        <aside>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt={`${profile.name} profile`} width='96' height='96' style={{ borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div aria-hidden='true' style={{ width: 96, height: 96, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 32, background: '#eee' }}>
                {profile.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h2 style={{ margin: 0 }}>{profile.name}</h2>
              <p style={{ margin: '6px 0 0' }}>{profile.email}</p>
            </div>
          </div>

          <dl>
            <div><dt>Total orders</dt><dd>{profile.totalOrders ?? 0}</dd></div>
            <div><dt>Joined</dt><dd>{formatDate(profile.createdAt)}</dd></div>
          </dl>
        </aside>

        <form onSubmit={submit} encType='multipart/form-data'>
          <TextInput name='name' value={form.name} onChange={updateField} placeholder='Name' ariaLabel='Name' />
          <TextInput name='phone' value={form.phone} onChange={updateField} placeholder='Phone' ariaLabel='Phone' />
          <label style={{ display: 'block', margin: '16px 0' }}>
            Address
            <textarea name='address' value={form.address} onChange={updateField} rows='4' style={{ display: 'block', width: '100%', marginTop: 8 }} />
          </label>
          <label style={{ display: 'block', margin: '16px 0' }}>
            Profile picture
            <input type='file' accept='image/jpeg,image/png,image/webp' onChange={(event) => setAvatar(event.target.files?.[0] || null)} />
          </label>
          {error && <p role='alert'>{error}</p>}
          {message && <p role='status'>{message}</p>}
          <Button type='submit' disabled={saving}>{saving ? 'Saving...' : 'Edit Profile'}</Button>
        </form>
      </div>
    </section>
  );
}

export default Profile;
