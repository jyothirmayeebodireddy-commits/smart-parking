import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import api from '../api/axiosConfig';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid rgba(167,139,250,0.3)',
        borderRadius: 12,
        padding: '10px 14px',
        color: '#fff',
        fontSize: 13
      }}>
        <div style={{color:'#A78BFA',fontWeight:600,marginBottom:4}}>{label}</div>
        <div>{payload[0].name}: <strong style={{color:'#E2E8F0'}}>{payload[0].value}</strong></div>
      </div>
    );
  }
  return null;
};

export default function PredictionDashboard() {
  const [vacancy, setVacancy] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [v, a] = await Promise.all([
        api.get('/predict/vacancy?hours=6'),
        api.get('/predict/arrival')
      ]);

      const vacData = (v.data.predictions || []).map(item => ({
        time: item.time,
        predicted_free_slots: item.predicted_free_slots ?? item.value ?? 0
      }));

      const arrData = (a.data.predictions || []).map(item => ({
        hour: item.hour,
        predicted_arrivals: item.predicted_arrivals ?? item.value ?? 0
      }));

      setVacancy(vacData);
      setArrivals(arrData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t1 = setInterval(load, 120000); // refresh every 2 min
    return () => clearInterval(t1);
  }, []);

  if (loading) return (
    <div style={{textAlign:'center',padding:'5rem',color:'#475569'}}>
      <div style={{
        width:50,height:50,
        border:'3px solid #7C3AED',
        borderTopColor:'transparent',
        borderRadius:'50%',
        animation:'spin 0.8s linear infinite',
        margin:'0 auto 1.5rem'
      }}/>
      <div style={{fontSize:16,color:'#94A3B8'}}>Loading AI predictions...</div>
    </div>
  );

  const predictedFree = vacancy.length > 0 ? vacancy[0].predicted_free_slots : '--';

  return (
    <div className="page">
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{
          fontSize:36,fontWeight:800,
          background:'linear-gradient(135deg,#fff,#EC4899)',
          WebkitBackgroundClip:'text',
          WebkitTextFillColor:'transparent',
          marginBottom:8
        }}>
          AI Predictions
        </h1>
        <p style={{color:'#475569',fontSize:15}}>· Updates every 2 minutes ·</p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
        gap:16,
        marginBottom:'2rem'
      }}>
        <div className="stat-card" style={{background:'linear-gradient(135deg,#7C3AED,#4F46E5)'}}>
          <div style={{fontSize:26,fontWeight:800,color:'#fff'}}>{predictedFree}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.75)',marginTop:4}}>Predicted Free</div>
        </div>
        <div className="stat-card" style={{background:'linear-gradient(135deg,#06B6D4,#0284C7)'}}>
          <div style={{fontSize:26,fontWeight:800,color:'#fff'}}>~87%</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.75)',marginTop:4}}>Model Accuracy</div>
        </div>
        <div className="stat-card" style={{background:'linear-gradient(135deg,#22C55E,#15803D)'}}>
          <div style={{fontSize:26,fontWeight:800,color:'#fff'}}>2 min</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.75)',marginTop:4}}>Next Update</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
        {/* Vacancy Chart */}
        <div className="glass" style={{padding:'1.5rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
            <div>
              <h3 style={{color:'#fff',fontSize:18,fontWeight:700}}>Free Slots Forecast</h3>
              <p style={{color:'#475569',fontSize:13,marginTop:4}}>Next 6 hours prediction</p>
            </div>
            <div style={{
              background:'rgba(124,58,237,0.2)',
              border:'1px solid rgba(124,58,237,0.4)',
              borderRadius:99,
              padding:'4px 14px',
              color:'#A78BFA',fontSize:12,fontWeight:500
            }}>LSTM Model</div>
          </div>
          {vacancy.length === 0 ? (
            <div style={{height:220,display:'flex',alignItems:'center',justifyContent:'center',color:'#334155',flexDirection:'column',gap:12}}>
              <div style={{fontSize:40}}>📊</div>
              <div>Waiting for backend data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={vacancy}>
                <defs>
                  <linearGradient id="vacGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                <XAxis dataKey="time" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <ReferenceLine y={5} stroke="#EF4444" strokeDasharray="6 3"
                             label={{value:'Low Alert',fill:'#EF4444',fontSize:10}}/>
                <Area type="monotone" dataKey="predicted_free_slots" name="Free slots"
                      stroke="#A78BFA" strokeWidth={3}
                      fill="url(#vacGrad)" dot={{fill:'#7C3AED',r:5,strokeWidth:2,stroke:'#fff'}}/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Arrivals Chart */}
        <div className="glass" style={{padding:'1.5rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
            <div>
              <h3 style={{color:'#fff',fontSize:18,fontWeight:700}}>Expected Arrivals</h3>
              <p style={{color:'#475569',fontSize:13,marginTop:4}}>Predicted vehicles per hour</p>
            </div>
            <div style={{
              background:'rgba(236,72,153,0.2)',
              border:'1px solid rgba(236,72,153,0.4)',
              borderRadius:99,
              padding:'4px 14px',
              color:'#F9A8D4',fontSize:12,fontWeight:500
            }}>Live Forecast</div>
          </div>
          {arrivals.length === 0 ? (
            <div style={{height:220,display:'flex',alignItems:'center',justifyContent:'center',color:'#334155',flexDirection:'column',gap:12}}>
              <div style={{fontSize:40}}>🚗</div>
              <div>Waiting for backend data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={arrivals}>
                <defs>
                  <linearGradient id="arrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EC4899"/>
                    <stop offset="100%" stopColor="#7C3AED"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                <XAxis dataKey="hour" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="predicted_arrivals" name="Arrivals"
                     fill="url(#arrGrad)" radius={[8,8,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}