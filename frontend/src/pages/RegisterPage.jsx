import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import logo from '../logo.png'; // ✅ FIX 1

export default function RegisterPage() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      setError('Please fill in all fields!'); return;
    }
    if (password !== confirm) {
      setError('Passwords do not match!'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }

    setLoading(true); 
    setError('');

    try {
      await api.post('/auth/register', null, {
        params: { name, email, password }
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch(err) {
      if (err.response?.status === 400)
        setError('Email already registered. Try another email to login .');
      else
        setError('Registration failed. ');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{
      minHeight:'80vh',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      padding:'1rem'
    }}>
      <div style={{
        width:'100%',
        maxWidth:'420px',
        background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:'24px',
        padding:'2.5rem',
        backdropFilter:'blur(20px)',
        animation:'fadeUp 0.5s ease forwards'
      }}>

        {/* ✅ FIXED LOGO (centered properly) */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{
            width:64,
            height:64,
            borderRadius:18,
            margin:'0 auto 1rem',
            overflow:'hidden',
            background:'rgba(20,20,40,0.4)',
            border:'1px solid rgba(255,255,255,0.15)',
            backdropFilter:'blur(10px)',
            boxShadow:'0 8px 32px rgba(0,0,0,0.25)'
          }}>
            <img
              src={logo}   // ✅ FIX 2
              alt="logo"
              style={{
                width:'100%',
                height:'100%',
                objectFit:'contain',
                padding:'10px'
              }}
            />
          </div>

          <h1 style={{
            fontSize:26,
            fontWeight:800,
            color:'#fff',
            marginBottom:6
          }}>
            Create account
          </h1>

          <p style={{ color:'#475569', fontSize:14 }}>
            Join SmartPark — it's completely free
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div style={{
            padding:'16px',
            borderRadius:12,
            textAlign:'center',
            background:'rgba(34,197,94,0.1)',
            border:'1px solid rgba(34,197,94,0.3)',
            color:'#4ADE80',
            fontSize:14,
            marginBottom:'1rem'
          }}>
            ✅ Account created! Redirecting to login...
          </div>
        )}

        <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>

          {[
            ['Full Name','text','Your full name',name,setName],
            ['Email address','email','you@example.com',email,setEmail],
            ['Password','password','Minimum 6 characters',password,setPassword],
            ['Confirm Password','password','Repeat your password',confirm,setConfirm],
          ].map(([label, type, placeholder, value, setter]) => (
            <div key={label}>
              <label style={{
                fontSize:13,
                color:'#64748B',
                display:'block',
                marginBottom:6,
                fontWeight:500
              }}>{label}</label>

              <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => setter(e.target.value)}
                onKeyDown={e => e.key==='Enter' && handleRegister()}
                style={{
                  width:'100%',
                  padding:'12px 16px',
                  borderRadius:12,
                  border:'1.5px solid rgba(255,255,255,0.1)',
                  background:'rgba(255,255,255,0.06)',
                  color:'#fff',
                  fontSize:14,
                  outline:'none',
                  transition:'all 0.3s'
                }}
              />
            </div>
          ))}

          {error && (
            <div style={{
              padding:'10px 14px',
              borderRadius:10,
              background:'rgba(239,68,68,0.1)',
              border:'1px solid rgba(239,68,68,0.3)',
              color:'#FCA5A5',
              fontSize:13
            }}>{error}</div>
          )}

          <button
            onClick={handleRegister}
            disabled={loading || success}
            style={{
              background:'linear-gradient(135deg,#EC4899,#7C3AED)',
              color:'#fff',
              border:'none',
              borderRadius:12,
              padding:'14px',
              fontSize:15,
              fontWeight:700,
              cursor:'pointer'
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div style={{textAlign:'center'}}>
            <span style={{color:'#475569', fontSize:14}}>
              Already have an account?{' '}
            </span>
            <Link to="/login" style={{
              color:'#A78BFA',
              fontWeight:600,
              textDecoration:'none'
            }}>
              Sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}