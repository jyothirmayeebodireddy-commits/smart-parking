import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function ParkingGrid({ onBookSlot }) {
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = async () => {
    try {
      const r = await api.get('/slots/');
      setSlots(r.data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    const timer = setInterval(fetchSlots, 5000);
    return () => clearInterval(timer);
  }, []);

  const count = (s) => slots.filter(x => x.status === s).length;

  if (loading) return (
    <div style={{textAlign:'center',padding:'4rem',color:'#64748B'}}>
      <div style={{width:40,height:40,border:'3px solid #7C3AED',
                   borderTopColor:'transparent',borderRadius:'50%',
                   animation:'spin 0.8s linear infinite',margin:'0 auto 1rem'}}/>
      <div>Connecting to parking system...</div>
    </div>
  );

  return (
    <div>
      {/* Stats */}
      <div style={{display:'flex',gap:'16px',marginBottom:'2rem',flexWrap:'wrap'}}>
        {[['Total',    slots.length,   '#3B82F6','#1D4ED8','P'],
          ['Free',     count('free'),  '#22C55E','#15803D','F'],
          ['Occupied', count('occupied'),'#EF4444','#B91C1C','O'],
          ['Reserved', count('reserved'),'#F97316','#C2410C','R']
        ].map(([label,num,light,dark,icon]) => (
          <div key={label} className="stat-card" style={{
            flex:'1',minWidth:'140px',
            background:`linear-gradient(135deg,${light},${dark})`,
          }}>
            <div style={{fontSize:36,fontWeight:800,color:'#fff'}}>{num}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',marginTop:4,fontWeight:500}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{display:'flex',gap:'20px',marginBottom:'1.5rem',flexWrap:'wrap'}}>
        {[['#22C55E','Free — click to book'],
          ['#EF4444','Occupied'],
          ['#F97316','Reserved']
        ].map(([color,label]) => (
          <div key={label} style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:14,height:14,borderRadius:4,background:color}}/>
            <span style={{color:'#94A3B8',fontSize:13}}>{label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      {slots.length === 0 ? (
        <div className="glass" style={{padding:'3rem',textAlign:'center',color:'#64748B'}}>
          <div style={{fontSize:48,marginBottom:16}}>🅿️</div>
          <div style={{fontSize:18,color:'#94A3B8',marginBottom:8}}>No slot data yet</div>
          <div style={{fontSize:14}}>Waiting for Jyothi's backend to connect...</div>
        </div>
      ) : (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill,minmax(64px,1fr))',
          gap:'10px'
        }}>
          {slots.map((s,i) => (
            <div key={s.id}
              className={`slot-card slot-${s.status}`}
              style={{animationDelay:`${i*0.02}s`}}
              onClick={() => s.status==='free' && onBookSlot && onBookSlot(s)}
              title={`Slot ${s.slot_number} — ${s.status}`}
            >
              <div>P{String(s.slot_number).padStart(2,'0')}</div>
              <div style={{fontSize:9,opacity:0.85,marginTop:3,textTransform:'uppercase',letterSpacing:'0.5px'}}>
                {s.status}
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{color:'#334155',fontSize:12,textAlign:'right',marginTop:'1rem'}}>
        Auto-refreshes every 5 seconds
      </p>
    </div>
  );
}