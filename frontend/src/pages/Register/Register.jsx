import { useContext, useState } from 'react';
import styles from '../../styles/AuthPages.module.css';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';

function GoogleIcon() {
  return (
    <svg className={styles.googleIcon} viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fill="#4285f4" d="M533.5 278.4c0-18-1.6-35.3-4.6-52.1H272v98.6h147.3c-6.3 33.3-25.4 61.5-54.2 80.4v66.9h87.5c51.2-47.1 80.9-116.6 80.9-193.8z"/>
      <path fill="#34a853" d="M272 544.3c73.7 0 135.6-24.4 180.8-66.3l-87.5-66.9c-24.3 16.3-55.3 26-93.3 26-71.7 0-132.5-48.4-154.3-113.6H27.6v71.4C72.9 487 167.2 544.3 272 544.3z"/>
      <path fill="#fbbc04" d="M117.7 325.5c-11.7-34.5-11.7-71.6 0-106.1V148H27.6C-0.9 197.6-8.7 252.6 7.6 305.5l110.1 20z"/>
      <path fill="#ea4335" d="M272 107.7c39.9 0 75.7 13.7 104 40.6l78.1-78.1C402 24.2 336.6 0 272 0 167.2 0 72.9 57.3 27.6 148l90.1 71.4C139.5 156.1 200.3 107.7 272 107.7z"/>
    </svg>
  );
}

function Register() {
  const { register, loading } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError(null);
    const res = await register({ name: form.name, email: form.email, password: form.password });
    if (res.ok) nav('/'); else setError(res.error || 'Registration failed');
  }

  return (
    <div className={styles.pageShell}>
      <div className={styles.formCard}>
        <h1>Create Account</h1>
        <p>Register quickly and start using voice-assisted restaurant ordering in Urdu.</p>
        <form className={styles.authForm} onSubmit={submit}>
          <TextInput value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} type='text' placeholder='Full name' ariaLabel='Name' />

          <TextInput value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} type='email' placeholder='Email' ariaLabel='Email' />

          <TextInput value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} type='password' placeholder='Password' ariaLabel='Password' showToggle />

          <Button className={styles.primaryBtn} type='submit' disabled={loading}>{loading ? 'Creating...' : 'Register'}</Button>

          <div className={styles.socialRow}>
            <Button variant='social' onClick={() => alert('Google sign-in not implemented (placeholder)')}>
              <GoogleIcon />
              <span>Continue with Google</span>
            </Button>
          </div>
        </form>
        {error && <div style={{ color: '#ff6b6b', marginTop: 12 }}>{error}</div>}
        <p className={styles.formFooter}>
          Already have an account? <a className={styles.linkText} href='/login'>Login</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
