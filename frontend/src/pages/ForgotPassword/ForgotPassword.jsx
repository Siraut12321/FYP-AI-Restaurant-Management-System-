import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../../styles/AuthPages.module.css';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import api from '../../api/api';

function ForgotPassword() {
  const [step, setStep] = useState('email'); // 'email' | 'reset'
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function requestReset(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess('Password reset link sent to your email. Please check your inbox.');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    
    if (!resetCode.trim() || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post('/auth/reset-password', {
        resetCode,
        newPassword,
      });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => nav('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.pageShell}>
      <div className={styles.formCard}>
        <h1>🔐 Reset Password</h1>
        
        {step === 'email' ? (
          <>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            <form className={styles.authForm} onSubmit={requestReset}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Email Address</label>
                <TextInput
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type='email'
                  placeholder='your@email.com'
                  ariaLabel='Email'
                />
              </div>

              {error && (
                <div style={{
                  background: 'rgba(255,107,107,0.1)',
                  border: '1px solid #ff6b6b',
                  color: '#ff6b6b',
                  padding: '12px',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: 'rgba(51,220,130,0.1)',
                  border: '1px solid #33dc82',
                  color: '#33dc82',
                  padding: '12px',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                }}>
                  ✓ {success}
                </div>
              )}

              <Button className={styles.primaryBtn} type='submit' disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <p>Enter the reset code from your email and set a new password.</p>
            <form className={styles.authForm} onSubmit={resetPassword}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Reset Code</label>
                <TextInput
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  type='text'
                  placeholder='Enter code from email'
                  ariaLabel='Reset code'
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>New Password</label>
                <TextInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type='password'
                  placeholder='••••••••'
                  ariaLabel='New password'
                  showToggle
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' }}>Confirm Password</label>
                <TextInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type='password'
                  placeholder='••••••••'
                  ariaLabel='Confirm password'
                  showToggle
                />
              </div>

              {error && (
                <div style={{
                  background: 'rgba(255,107,107,0.1)',
                  border: '1px solid #ff6b6b',
                  color: '#ff6b6b',
                  padding: '12px',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: 'rgba(51,220,130,0.1)',
                  border: '1px solid #33dc82',
                  color: '#33dc82',
                  padding: '12px',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                }}>
                  ✓ {success}
                </div>
              )}

              <Button className={styles.primaryBtn} type='submit' disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <Button 
                type='button' 
                variant='outline' 
                onClick={() => setStep('email')}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', marginTop: 8 }}
              >
                Back
              </Button>
            </form>
          </>
        )}

        <div style={{ marginTop: 18, fontSize: '0.85rem', textAlign: 'center' }}>
          <Link to='/login' style={{ color: '#ffd166', textDecoration: 'none' }}>Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
