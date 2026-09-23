import { useState, useRef, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        email: emailRef.current?.value?.trim() || '',
        username: usernameRef.current?.value?.trim() || '',
        password: passwordRef.current?.value?.trim() || '',
      });
      navigate('/app', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '6px',
    border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '360px' }}>
        <h2 style={{ margin: '0 0 1.5rem', textAlign: 'center', color: '#1a1a2e' }}>Create Account</h2>
        {error && <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: '0 0 1rem' }}>{error}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input ref={emailRef} type="text" placeholder="Email" style={inputStyle} />
          <input ref={usernameRef} type="text" placeholder="Username" style={inputStyle} />
          <input ref={passwordRef} type="password" placeholder="Password (min 8 chars)" style={inputStyle} />
          <button type="submit" onClick={(e) => handleSubmit(e as any)} disabled={loading} style={{ padding: '10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </div>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: '#4f46e5', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </form>
    </div>
  );
}