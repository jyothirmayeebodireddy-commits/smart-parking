import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      padding: '2rem'
    }}>

      {/* 404 TEXT */}
      <h1 style={{
        fontSize: '80px',
        fontWeight: '800',
        marginBottom: '10px',
        background: 'linear-gradient(135deg,#7C3AED,#EC4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        404
      </h1>

      <h2 style={{
        fontSize: '24px',
        color: '#fff',
        marginBottom: '10px'
      }}>
        Page Not Found
      </h2>

      <p style={{
        color: '#64748B',
        marginBottom: '20px'
      }}>
        The page you are looking for does not exist.
      </p>

      {/* BUTTON */}
      <Link to="/" style={{
        padding: '12px 20px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg,#7C3AED,#4F46E5)',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: '600'
      }}>
        Go Back Home
      </Link>

    </div>
  );
}