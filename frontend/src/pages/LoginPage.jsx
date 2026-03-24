import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://10.39.225.142:8000';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const res = await axios.post(
        `${BASE_URL}/auth/login`,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      localStorage.setItem('token',     res.data.access_token);
      localStorage.setItem('userEmail', res.data.user_email || email);
      localStorage.setItem('userName',  res.data.user_name  || email);
      navigate('/');
    } catch(err) {
      console.error('Login error:', err);
      if (err.response?.status === 401)
        setError('Wrong email or password. Try again.');
      else if (err.response?.status === 404)
        setError('Server error. Check backend is running.');
      else
        setError('Login failed. Is backend running at ' + BASE_URL + '?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'80vh', display:'flex',
      alignItems:'center', justifyContent:'center',
      padding:'1rem'
    }}>
      <div style={{
        width:'100%', maxWidth:'420px',
        background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:'24px', padding:'2.5rem',
        backdropFilter:'blur(20px)',
        animation:'fadeUp 0.5s ease forwards'
      }}>

        <div style={{textAlign:'center', marginBottom:'2rem'}}>
          <div style={{
            width:64, height:64, borderRadius:18,
            margin:'0 auto 1rem',
            background:'linear-gradient(135deg,#7C3AED,#4F46E5)',
            display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:22,
            fontWeight:800, color:'#fff',
            boxShadow:'0 8px 32px rgba(124,58,237,0.4)'
          }}>VT</div>
          <h1 style={{fontSize:26, fontWeight:800, color:'#fff', marginBottom:6}}>
            Welcome back
          </h1>
          <p style={{color:'#475569', fontSize:14}}>
            Sign in to your SmartPark account
          </p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>

          <div>
            <label style={{
              fontSize:13, color:'#64748B',
              display:'block', marginBottom:6, fontWeight:500
            }}>Email address</label>
            <input
              type="email"
              placeholder="you@veltech.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width:'100%', padding:'12px 16px', borderRadius:12,
                border:'1.5px solid rgba(255,255,255,0.1)',
                background:'rgba(255,255,255,0.06)',
                color:'#fff', fontSize:14, outline:'none',
                transition:'all 0.3s', colorScheme:'dark'
              }}
              onFocus={e => e.target.style.borderColor='#7C3AED'}
              onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{
              fontSize:13, color:'#64748B',
              display:'block', marginBottom:6, fontWeight:500
            }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width:'100%', padding:'12px 16px', borderRadius:12,
                border:'1.5px solid rgba(255,255,255,0.1)',
                background:'rgba(255,255,255,0.06)',
                color:'#fff', fontSize:14, outline:'none',
                transition:'all 0.3s', colorScheme:'dark'
              }}
              onFocus={e => e.target.style.borderColor='#7C3AED'}
              onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <div style={{
              padding:'10px 14px', borderRadius:10,
              background:'rgba(239,68,68,0.1)',
              border:'1px solid rgba(239,68,68,0.3)',
              color:'#FCA5A5', fontSize:13
            }}>{error}</div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background:'linear-gradient(135deg,#7C3AED,#4F46E5)',
              color:'#fff', border:'none', borderRadius:12,
              padding:'14px', fontSize:15, fontWeight:700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition:'all 0.3s',
              boxShadow:'0 4px 20px rgba(124,58,237,0.4)',
              marginTop:'0.5rem'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{
            display:'flex', alignItems:'center',
            gap:12, margin:'0.5rem 0'
          }}>
            <div style={{flex:1, height:'1px', background:'rgba(255,255,255,0.08)'}}/>
            <span style={{color:'#334155', fontSize:13}}>or</span>
            <div style={{flex:1, height:'1px', background:'rgba(255,255,255,0.08)'}}/>
          </div>

          <div style={{textAlign:'center'}}>
            <span style={{color:'#475569', fontSize:14}}>
              Don't have an account?{' '}
            </span>
            <Link to="/register" style={{
              color:'#A78BFA', fontSize:14,
              fontWeight:600, textDecoration:'none'
            }}>
              Create one free
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}