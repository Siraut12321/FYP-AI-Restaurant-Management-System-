import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../../styles/AuthPages.module.css';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';

const GMAIL_RE = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const errStyle = { color: '#ff6b6b', fontSize: '0.75rem', marginTop: 4 };

function Register() {
  const { register, loading } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validations, setValidations] = useState({});
  const nav = useNavigate();

  const validateForm = () => {
    const v = {};
    if (!form.name.trim()) v.name = 'Name is required.';
    if (!form.email.trim()) v.email = 'Email is required.';
    else if (!GMAIL_RE.test(form.email)) v.email = 'Please enter a valid Gmail address ending with @gmail.com.';
    if (!form.password) v.password = 'Password is required.';
    else if (form.password.length < 9 || form.password.length > 12) v.password = 'Password must be between 9 and 12 characters.';
    if (!form.confirmPassword) v.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) v.confirmPassword = 'Passwords do not match.';
    setValidations(v);
    return Object.keys(v).length === 0;
  };

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!validateForm()) return;
    const res = await register({ name: form.name, email: form.email, password: form.password });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => nav('/'), 1500);
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  }

  return (
    <div className={styles.pageShell}>
      <div className={styles.formCard}>
        <h1>🔥 Create Your Account</h1>
        <p>Join Hot & Spicy and enjoy voice-assisted restaurant ordering in Urdu.</p>

        <form className={styles.authForm} onSubmit={submit}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Full Name</label>
            <TextInput
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              type='text'
              placeholder='Your full name'
              ariaLabel='Full name'
            />
            {validations.name && <div style={errStyle}>{validations.name}</div>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Email Address</label>
            <TextInput
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              type='email'
              placeholder='your@gmail.com'
              ariaLabel='Email'
            />
            {validations.email && <div style={errStyle}>{validations.email}</div>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Password</label>
            <TextInput
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value.slice(0, 12) }))}
              type='password'
              placeholder='••••••••'
              ariaLabel='Password'
              showToggle
            />
            {validations.password && <div style={errStyle}>{validations.password}</div>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Confirm Password</label>
            <TextInput
              value={form.confirmPassword}
              onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value.slice(0, 12) }))}
              type='password'
              placeholder='••••••••'
              ariaLabel='Confirm password'
              showToggle
            />
            {validations.confirmPassword && <div style={errStyle}>{validations.confirmPassword}</div>}
          </div>

          {error && (
            <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '12px', borderRadius: 10, fontSize: '0.85rem' }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(51,220,130,0.1)', border: '1px solid #33dc82', color: '#33dc82', padding: '12px', borderRadius: 10, fontSize: '0.85rem' }}>
              ✓ Account created! Redirecting...
            </div>
          )}

          <Button className={styles.primaryBtn} type='submit' disabled={loading || success}>
            {loading ? 'Creating account...' : success ? 'Redirecting...' : 'Create Account'}
          </Button>
        </form>

        <div style={{ marginTop: 18, fontSize: '0.85rem', textAlign: 'center' }}>
          Already have an account? <Link to='/login' style={{ color: '#ffd166', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
