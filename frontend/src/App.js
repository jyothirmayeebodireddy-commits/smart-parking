import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ParkingGrid from './components/ParkingGrid';
import PredictionDashboard from './pages/PredictionDashboard';
import ReservationPage from './pages/ReservationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import bgImage from './bg.jpg';


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{
    font-family:'Inter',sans-serif;
    overflow-x:hidden;
    min-height:100vh;
  }

  @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.92)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  @keyframes shimmer{
    0%  {background-position:-200% 0}
    100%{background-position:200% 0}
  }
  @keyframes colorCycle{
    0%  {background:linear-gradient(135deg,#7C3AED,#4F46E5)}
    25% {background:linear-gradient(135deg,#EC4899,#8B5CF6)}
    50% {background:linear-gradient(135deg,#06B6D4,#3B82F6)}
    75% {background:linear-gradient(135deg,#10B981,#06B6D4)}
    100%{background:linear-gradient(135deg,#7C3AED,#4F46E5)}
  }
  @keyframes borderGlow{
    0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.6)}
    33%    {box-shadow:0 0 20px rgba(236,72,153,0.6)}
    66%    {box-shadow:0 0 20px rgba(6,182,212,0.6)}
  }
  @keyframes fogMove{
    0%  {transform:translateX(-5%) scale(1.1)}
    50% {transform:translateX(5%)  scale(1.15)}
    100%{transform:translateX(-5%) scale(1.1)}
  }
  @keyframes navGlow{
    0%,100%{text-shadow:0 0 10px rgba(167,139,250,0.5)}
    50%    {text-shadow:0 0 20px rgba(167,139,250,1)}
  }

  .page{animation:fadeUp 0.6s ease forwards;}

  .nav-link{
    color:#CBD5E1;text-decoration:none;font-size:14px;font-weight:500;
    padding:8px 18px;border-radius:10px;transition:all 0.3s;
    border:1px solid transparent;
  }
  .nav-link:hover{
    color:#fff;
    background:rgba(255,255,255,0.1);
    border-color:rgba(255,255,255,0.15);
  }
  .nav-link.active{
    color:#A78BFA;
    background:rgba(167,139,250,0.15);
    border-color:rgba(167,139,250,0.4);
    animation:navGlow 2s infinite;
  }

  .slot-card{
    border-radius:10px;padding:10px 6px;text-align:center;
    font-weight:700;font-size:12px;transition:all 0.2s;
    border:2px solid transparent;cursor:pointer;
    animation:fadeUp 0.4s ease forwards;
    position:relative;overflow:hidden;
  }
  .slot-card::after{
    content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent);
    pointer-events:none;
  }
  .slot-card:hover{transform:scale(1.15) translateY(-3px);z-index:10;}
  .slot-free    {background:linear-gradient(135deg,#22C55E,#16A34A);color:#fff;border-color:#4ADE80;box-shadow:0 4px 15px rgba(34,197,94,0.4);}
  .slot-occupied{background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff;border-color:#F87171;cursor:not-allowed;}
  .slot-reserved{background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;border-color:#FB923C;cursor:not-allowed;}
  .slot-free:hover{box-shadow:0 8px 30px rgba(34,197,94,0.7);}

  .glass{
    background:rgba(0,0,0,0.35);
    border:1px solid rgba(255,255,255,0.12);
    backdrop-filter:blur(24px);
    -webkit-backdrop-filter:blur(24px);
    border-radius:20px;
  }

  .stat-card{
    border-radius:20px;padding:1.5rem;text-align:center;
    transition:all 0.4s;cursor:default;position:relative;overflow:hidden;
    animation:fadeUp 0.5s ease forwards;
  }
  .stat-card::before{
    content:'';position:absolute;inset:0;
    background:radial-gradient(circle at 50% 0%,rgba(255,255,255,0.15),transparent 60%);
    pointer-events:none;
  }
  .stat-card:hover{transform:translateY(-10px) scale(1.04);}

  .live-dot{
    width:10px;height:10px;background:#22C55E;border-radius:50%;
    display:inline-block;animation:pulse 1.5s infinite;
    box-shadow:0 0 12px #22C55E,0 0 24px rgba(34,197,94,0.5);
  }

  .label{font-size:13px;color:#94A3B8;display:block;margin-bottom:8px;font-weight:500;}

  .shimmer-text{
    background:linear-gradient(90deg,#A78BFA,#EC4899,#06B6D4,#A78BFA);
    background-size:200%;
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    animation:shimmer 4s linear infinite;
  }

  ::-webkit-scrollbar{width:6px;}
  ::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);}
  ::-webkit-scrollbar-thumb{background:rgba(167,139,250,0.4);border-radius:3px;}
  ::-webkit-scrollbar-thumb:hover{background:rgba(167,139,250,0.7);}
`;

function NavBar() {
  const location   = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');
  const userName   = localStorage.getItem('userName') || '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  return (
    <nav style={{
      background:'rgba(255, 250, 250, 0)',
      backdropFilter:'blur(30px)',
      WebkitBackdropFilter:'blur(30px)',
      padding:'0 2rem',
      display:'flex', alignItems:'center',
      justifyContent:'space-between',
      height:'64px',
      borderBottom:'1px solid rgba(255,255,255,0.08)',
      position:'sticky', top:0, zIndex:200,
      boxShadow:'0 4px 30px rgba(0,0,0,0.4)',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
        <div style={{
          width:38, height:38, borderRadius:12,
          background:'linear-gradient(135deg,#7C3AED,#4F46E5)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:14, fontWeight:800, color:'#fff',
          animation:'borderGlow 4s infinite',
          flexShrink:0,
        }}>VT</div>
        <div>
          <span style={{color:'#fff', fontWeight:800, fontSize:20}}>Vel Tech </span>
          <span style={{
            background:'linear-gradient(135deg,#A78BFA,#EC4899,#06B6D4)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            fontWeight:800, fontSize:20,
          }}> Smart Parking using AI</span>
        </div>
      </div>

      <div style={{display:'flex', gap:'4px'}}>
        {[['/', 'Dashboard'],['/reserve','Reserve'],['/predictions','Predictions']]
          .map(([path, label]) => (
          <Link key={path} to={path}
            className={`nav-link ${location.pathname===path ? 'active' : ''}`}>
            {label}
          </Link>
        ))}
      </div>

      <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
        <div style={{
          display:'flex', alignItems:'center', gap:'8px',
          background:'rgba(34,197,94,0.1)',
          padding:'6px 14px', borderRadius:99,
          border:'1px solid rgba(34,197,94,0.3)',
        }}>
          <span className="live-dot"/>
          <span style={{color:'#4ADE80', fontSize:13, fontWeight:600}}>Live</span>
        </div>

        {isLoggedIn ? (
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <div style={{
              width:32, height:32, borderRadius:'50%',
              background:'linear-gradient(135deg,#7C3AED,#EC4899)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:700, color:'#fff',
            }}>
              {userName[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{color:'#CBD5E1', fontSize:13, fontWeight:500}}>
              {userName.split(' ')[0]}
            </span>
            <button onClick={handleLogout} style={{
              background:'rgba(239,68,68,0.15)',
              color:'#FCA5A5',
              border:'1px solid rgba(239,68,68,0.3)',
              borderRadius:8, padding:'6px 14px',
              fontSize:12, fontWeight:600, cursor:'pointer',
              transition:'all 0.2s',
            }}
            onMouseOver={e => e.target.style.background='rgba(239,68,68,0.3)'}
            onMouseOut={e  => e.target.style.background='rgba(239,68,68,0.15)'}
            >Logout</button>
          </div>
        ) : (
          <Link to="/login"
            className={`nav-link ${location.pathname==='/login' ? 'active' : ''}`}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <style>{styles}</style>

      {/* Background Image */}
      <div style={{
        position:'fixed', inset:0, zIndex:0,
        backgroundImage:`url(${bgImage})`,
        backgroundSize:'cover',
        backgroundPosition:'center',
        backgroundRepeat:'no-repeat',
        filter:'brightness(1) saturate(1) contrast(1.1)',
      }}/>

      {/* Dark overlay for readability */}
      <div style={{
        position:'fixed', inset:0, zIndex:1,
        background:'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,5,16,0.1) 100%)',
      }}/>

      {/* Fog animation layer */}
      <div style={{
        position:'fixed', inset:0, zIndex:2,
        backgroundImage:`url(${bgImage})`,
        backgroundSize:'120% auto',
        backgroundPosition:'center top',
        opacity:0.08,
        filter:'blur(8px)',
        animation:'fogMove 20s ease-in-out infinite',
        pointerEvents:'none',
      }}/>

      {/* Main content */}
      <div style={{
        minHeight:'100vh',
        background:'transparent',
        position:'relative',
        zIndex:10,
      }}>
        <NavBar/>
        <div style={{maxWidth:'1280px', margin:'0 auto', padding:'2rem 1.5rem'}}>
          <Routes>
            <Route path="/" element={
              <div className="page">
                <div style={{marginBottom:'2rem'}}>
                  <div style={{
                    display:'inline-block',
                    background:'rgba(124,58,237,0.2)',
                    border:'1px solid rgba(124,58,237,0.4)',
                    borderRadius:99, padding:'4px 16px',
                    fontSize:12, color:'#C4B5FD',
                    fontWeight:600, marginBottom:12,
                    letterSpacing:'0.08em',
                    backdropFilter:'blur(10px)',
                  }}>
                    POWERED BY Vel Tech University
                  </div>
                  <h1 style={{
                    fontSize:40, fontWeight:800,
                    marginBottom:10, lineHeight:1.2,
                  }}>
                    
                    <span className="shimmer-text"> Live Parking </span>
                  </h1>
                  <p style={{
                    color:'#333538', fontSize:15,
                    textShadow:'0 1px 8px rgba(126, 126, 126, 0.8)'
                  }}>
                    Real-time slot detection · Auto-refreshes every 5 seconds · Powered by AI and IoT
                  </p>
                </div>
                <ParkingGrid/>
              </div>
            }/>
            <Route path="/reserve"     element={<ReservationPage/>}/>
            <Route path="/predictions" element={<PredictionDashboard/>}/>
            <Route path="/login"       element={<LoginPage/>}/>
            <Route path="/register"    element={<RegisterPage/>}/>
            <Route path="*"            element={<NotFoundPage/>}/>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}