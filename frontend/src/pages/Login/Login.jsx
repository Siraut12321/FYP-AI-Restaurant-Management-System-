import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../../styles/AuthPages.module.css';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import { AuthContext } from '../../context/AuthContext';

const GMAIL_RE = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const errStyle = { color: '#ff6b6b', fontSize: '0.75rem', marginTop: 4 };

function Login() {
  const { login, loading } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [validations, setValidations] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const nav = useNavigate();

  const validateForm = () => {
    const v = {};
    if (!form.email.trim()) v.email = 'Email is required.';
    else if (!GMAIL_RE.test(form.email)) v.email = 'Please enter a valid Gmail address ending with @gmail.com.';
    if (!form.password) v.password = 'Password is required.';
    else if (form.password.length < 9 || form.password.length > 12) v.password = 'Password must be between 9 and 12 characters.';
    setValidations(v);
    return Object.keys(v).length === 0;
  };

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!validateForm()) return;
    const res = await login(form.email, form.password);
    if (res.ok) {
      setSuccess(true);
      const role = res.user?.role;
      setTimeout(() => nav(role === 'admin' || role === 'staff' ? '/admin/dashboard' : '/'), 300);
    } else {
      setError(res.error || 'Login failed. Please check your email and password.');
    }
  }

  return (
    <div className={styles.pageShell}>
      <div className={styles.formCard}>
        <h1>🌶️ Welcome Back</h1>
        <p>Sign in to your Hot & Spicy account and access your orders and the AI restaurant assistant.</p>

        <form className={styles.authForm} onSubmit={submit}>
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

          {error && (
            <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '12px', borderRadius: 10, fontSize: '0.85rem' }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(51,220,130,0.1)', border: '1px solid #33dc82', color: '#33dc82', padding: '12px', borderRadius: 10, fontSize: '0.85rem' }}>
              ✓ Login successful. Redirecting...
            </div>
          )}

          <Button className={styles.primaryBtn} type='submit' disabled={loading || success}>
            {loading ? 'Signing in...' : success ? 'Redirecting...' : 'Sign In'}
          </Button>
        </form>

        <div style={{ marginTop: 18, fontSize: '0.85rem', textAlign: 'center' }}>
          Don't have an account? <Link to='/register' style={{ color: '#ffd166', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
