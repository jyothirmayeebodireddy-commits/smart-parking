import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axiosConfig';

export default function ReservationPage() {
  const [myReservations, setMyReservations] = useState([]);
  const [startTime,      setStartTime]      = useState('');
  const [endTime,        setEndTime]        = useState('');
  const [slotId,         setSlotId]         = useState('');
  const [message,        setMessage]        = useState('');
  const [msgType,        setMsgType]        = useState('');
  const [qrToken,        setQrToken]        = useState('');
  const [loading,        setLoading]        = useState(false);
  const [isLoggedIn,     setIsLoggedIn]     = useState(false);
  const [showQR,         setShowQR]         = useState(false);
  const [expandedQR,     setExpandedQR]     = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    try {
      const res = await api.get('/reservations/me');
      setMyReservations(res.data);
    } catch(e) {
      console.error('Fetch reservations error:', e);
    }
  };

  const handleBook = async () => {
    if (!slotId || !startTime || !endTime) {
      setMessage('Please fill in all fields!');
      setMsgType('error');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please login first to book a slot!');
      setMsgType('error');
      return;
    }
    setLoading(true);
    setMessage('');
    setQrToken('');
    setShowQR(false);
    try {
      const res = await api.post('/reservations/', {
        slot_id:    parseInt(slotId),
        start_time: startTime,
        end_time:   endTime,
      });
      setQrToken(res.data.qr_token);
      setShowQR(true);
      setMessage('Booking confirmed!');
      setMsgType('success');
      fetchMyReservations();
    } catch(err) {
      console.error('Booking error:', err);
      if (err.response?.status === 409)
        setMessage('Slot already booked for this time!');
      else if (err.response?.status === 401)
        setMessage('Please login first!');
      else if (err.response?.status === 400)
        setMessage(err.response?.data?.detail || 'Start time must be in the future!');
      else
        setMessage('Booking failed. Try again.');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      setMessage('Reservation cancelled.');
      setMsgType('success');
      fetchMyReservations();
    } catch(e) {
      setMessage('Could not cancel. Try again.');
      setMsgType('error');
    }
  };

  return (
    <div className="page" style={{maxWidth:720, margin:'0 auto', padding:'1rem'}}>

      {/* QR Enlarged Modal */}
      {expandedQR && (
        <div
          onClick={() => setExpandedQR(null)}
          style={{
            position:'fixed', inset:0, zIndex:1000,
            background:'rgba(0,0,0,0.85)',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            cursor:'pointer'
          }}
        >
          <div style={{
            background:'white', padding:32,
            borderRadius:24,
            boxShadow:'0 0 60px rgba(124,58,237,0.5)',
            display:'flex', flexDirection:'column',
            alignItems:'center', gap:16
          }}>
            <QRCodeSVG value={expandedQR} size={280} level="H"/>
            <div style={{
              fontFamily:'monospace', fontSize:12,
              color:'#333', textAlign:'center',
              maxWidth:280, wordBreak:'break-all'
            }}>
              {expandedQR}
            </div>
            <div style={{color:'#666', fontSize:13}}>
              Tap anywhere to close
            </div>
          </div>
        </div>
      )}

      <div style={{marginBottom:'2rem'}}>
        <h1 style={{
          fontSize:36, fontWeight:800,
          background:'linear-gradient(135deg,#fff,#4ADE80)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          marginBottom:8
        }}>Reserve a Slot</h1>
        <p style={{color:'#475569', fontSize:15}}>
          Book your parking spot in advance
        </p>
      </div>

      {!isLoggedIn && (
        <div style={{
          padding:'1rem 1.5rem', borderRadius:16, marginBottom:'1.5rem',
          background:'rgba(249,115,22,0.1)',
          border:'1px solid rgba(249,115,22,0.3)',
          color:'#FED7AA', fontSize:14
        }}>
          Please{' '}
          <a href="/login" style={{color:'#FB923C', fontWeight:600}}>login</a>
          {' '}first to book a parking slot.
        </div>
      )}

      {/* Booking Form */}
      <div className="glass" style={{padding:'2rem', marginBottom:'1.5rem'}}>
        <h3 style={{color:'#fff', fontSize:18, fontWeight:700, marginBottom:'1.5rem'}}>
          New Booking
        </h3>

        <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>

          <div>
            <label style={{
              fontSize:13, color:'#64748B',
              display:'block', marginBottom:6, fontWeight:500
            }}>Slot Number (1–50)</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={slotId}
              min="1" max="50"
              onChange={e => setSlotId(e.target.value)}
              style={{
                width:'100%', padding:'12px 16px', borderRadius:12,
                border:'1.5px solid rgba(255,255,255,0.1)',
                background:'rgba(255,255,255,0.06)',
                color:'#fff', fontSize:14, outline:'none',
                colorScheme:'dark'
              }}
            />
          </div>

          <div>
            <label style={{
              fontSize:13, color:'#64748B',
              display:'block', marginBottom:6, fontWeight:500
            }}>Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              style={{
                width:'100%', padding:'12px 16px', borderRadius:12,
                border:'1.5px solid rgba(255,255,255,0.1)',
                background:'rgba(255,255,255,0.06)',
                color:'#fff', fontSize:14, outline:'none',
                colorScheme:'dark'
              }}
            />
          </div>

          <div>
            <label style={{
              fontSize:13, color:'#64748B',
              display:'block', marginBottom:6, fontWeight:500
            }}>End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              style={{
                width:'100%', padding:'12px 16px', borderRadius:12,
                border:'1.5px solid rgba(255,255,255,0.1)',
                background:'rgba(255,255,255,0.06)',
                color:'#fff', fontSize:14, outline:'none',
                colorScheme:'dark'
              }}
            />
          </div>

          <button
            onClick={handleBook}
            disabled={loading}
            style={{
              background:'linear-gradient(135deg,#7C3AED,#4F46E5)',
              color:'#fff', border:'none', borderRadius:12,
              padding:'14px', fontSize:15, fontWeight:700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition:'all 0.3s',
              boxShadow:'0 4px 20px rgba(124,58,237,0.4)'
            }}
          >
            {loading
              ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <div style={{
                    width:16,height:16,
                    border:'2px solid rgba(255,255,255,0.4)',
                    borderTopColor:'#fff',borderRadius:'50%',
                    animation:'spin 0.7s linear infinite'
                  }}/>
                  Booking...
                </span>
              : 'Book Now'
            }
          </button>

        </div>

        {message && (
          <div style={{
            marginTop:'1rem', padding:'12px 16px', borderRadius:12,
            background: msgType==='success'
              ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${msgType==='success'
              ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: msgType==='success' ? '#4ADE80' : '#FCA5A5',
            fontSize:14
          }}>{message}</div>
        )}

        {/* QR CODE after booking */}
        {showQR && qrToken && (
          <div style={{
            marginTop:'1.5rem', padding:'1.5rem', borderRadius:16,
            background:'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(236,72,153,0.2))',
            border:'1px solid rgba(167,139,250,0.4)',
            textAlign:'center'
          }}>
            <div style={{
              color:'#A78BFA', fontSize:13,
              fontWeight:600, marginBottom:16
            }}>
              Your QR Code — Show this at the parking gate
            </div>

            {/* QR Code — click to enlarge */}
            <div
              onClick={() => setExpandedQR(qrToken)}
              style={{
                display:'inline-block',
                background:'white', padding:16,
                borderRadius:16, cursor:'pointer',
                transition:'all 0.3s',
                boxShadow:'0 0 30px rgba(124,58,237,0.4)',
                marginBottom:12
              }}
              onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'}
              onMouseOut={e  => e.currentTarget.style.transform='scale(1)'}
              title="Click to enlarge"
            >
              <QRCodeSVG
                value={qrToken}
                size={160}
                level="H"
                includeMargin={true}
              />
            </div>

            <div style={{color:'#64748B', fontSize:12, marginBottom:8}}>
              Click QR code to enlarge
            </div>

            <div style={{
              fontFamily:'monospace', fontSize:11,
              color:'#475569', wordBreak:'break-all',
              padding:'8px 12px',
              background:'rgba(0,0,0,0.3)',
              borderRadius:8
            }}>
              {qrToken}
            </div>
          </div>
        )}
      </div>

      {/* My Reservations */}
      <div className="glass" style={{padding:'2rem'}}>
        <h3 style={{
          color:'#fff', fontSize:18,
          fontWeight:700, marginBottom:'1.5rem'
        }}>
          My Reservations
        </h3>

        {!isLoggedIn ? (
          <p style={{color:'#475569', fontSize:14}}>
            Login to view your reservations.
          </p>
        ) : myReservations.length === 0 ? (
          <div style={{textAlign:'center', padding:'2rem', color:'#334155'}}>
            <div style={{fontSize:40, marginBottom:12}}>🅿️</div>
            <div style={{color:'#475569'}}>No reservations yet</div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {myReservations.map((r) => (
              <div key={r.id} style={{
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:14, padding:'14px 18px',
              }}>
                <div style={{
                  display:'flex', alignItems:'center',
                  justifyContent:'space-between',
                  flexWrap:'wrap', gap:10, marginBottom:10
                }}>
                  <div>
                    <div style={{color:'#fff', fontWeight:700, fontSize:16}}>
                      Slot P{String(r.slot_id).padStart(2,'0')}
                    </div>
                    <div style={{color:'#475569', fontSize:12, marginTop:4}}>
                      {new Date(r.start_time).toLocaleString()}
                      {' → '}
                      {new Date(r.end_time).toLocaleString()}
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <span style={{
                      padding:'4px 12px', borderRadius:99,
                      fontSize:12, fontWeight:600,
                      background: r.status==='active'
                        ? 'rgba(34,197,94,0.15)'
                        : 'rgba(239,68,68,0.15)',
                      color: r.status==='active' ? '#4ADE80' : '#FCA5A5',
                      border: `1px solid ${r.status==='active'
                        ? 'rgba(34,197,94,0.3)'
                        : 'rgba(239,68,68,0.3)'}`,
                    }}>{r.status}</span>
                    {r.status === 'active' && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        style={{
                          background:'rgba(239,68,68,0.15)',
                          color:'#FCA5A5',
                          border:'1px solid rgba(239,68,68,0.3)',
                          borderRadius:8, padding:'6px 14px',
                          fontSize:12, fontWeight:600, cursor:'pointer'
                        }}
                      >Cancel</button>
                    )}
                  </div>
                </div>

                {/* Mini QR for each reservation */}
                <div style={{
                  display:'flex', alignItems:'center', gap:12,
                  borderTop:'1px solid rgba(255,255,255,0.06)',
                  paddingTop:10
                }}>
                  <div
                    onClick={() => setExpandedQR(r.qr_token)}
                    style={{
                      background:'white', padding:6,
                      borderRadius:8, cursor:'pointer',
                      transition:'transform 0.2s',
                      flexShrink:0
                    }}
                    onMouseOver={e => e.currentTarget.style.transform='scale(1.1)'}
                    onMouseOut={e  => e.currentTarget.style.transform='scale(1)'}
                    title="Click to enlarge QR"
                  >
                    <QRCodeSVG value={r.qr_token} size={48} level="M"/>
                  </div>
                  <div style={{
                    fontFamily:'monospace', fontSize:10,
                    color:'#475569', wordBreak:'break-all'
                  }}>
                    {r.qr_token}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}