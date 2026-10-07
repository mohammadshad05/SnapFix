import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Water leakage');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [filter, setFilter] = useState('All');

  // Auth States
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('userData')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Auth Form Fields
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState('user');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const clearAuthFields = () => {
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
    setAuthRole('user');
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to fetch tickets', 'error');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? 'login' : 'register';
    const payload = authMode === 'login' 
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword, role: authRole };

    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, payload);
      
      if (authMode === 'login') {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userData', JSON.stringify(res.data.user));
        showNotification(`Welcome back, ${res.data.user.name}!`);
        setIsAuthModalOpen(false);
        clearAuthFields();
      } else {
        showNotification('Registration successful! Please login.');
        setAuthMode('login');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Authentication Failed', 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    showNotification('Logged out successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showNotification('⚠️️ Please login to submit a ticket!', 'error');
      setIsAuthModalOpen(true);
      return;
    }
    if (!title || !location) {
      showNotification('⚠️ Fill in all details!', 'error');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/tickets',
        { title, category, location, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets([res.data, ...tickets]);
      setTitle('');
      setLocation('');
      setPriority('Medium');
      showNotification('🎉 Ticket raised successfully!');
    } catch (err) {
      showNotification('❌ Failed to raise ticket', 'error');
    }
  };

  const handleResolve = async (id) => {
    if (!user || user.role !== 'admin') {
      showNotification('🔒 Admin access required to resolve tickets!', 'error');
      return;
    }

    try {
      await axios.patch(
        `http://localhost:5000/api/tickets/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(tickets.map((t) => (t._id === id ? { ...t, status: 'Resolved' } : t)));
      showNotification('✅ Status set to Resolved!');
    } catch (err) {
      showNotification('❌ Error updating status', 'error');
    }
  };

  const categories = [
    { name: 'Water leakage', icon: '💧' },
    { name: 'Electricity issue', icon: '⚡' },
    { name: 'Cleanliness', icon: '🧹' },
    { name: 'Other', icon: '⚙️' },
  ];

  const priorities = [
    { name: 'Low', icon: '🟢', color: '#10b981' },
    { name: 'Medium', icon: '🟡', color: '#f59e0b' },
    { name: 'Urgent', icon: '🔴', color: '#f43f5e' },
  ];

  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'Pending') return t.status === 'Pending';
    if (filter === 'Resolved') return t.status === 'Resolved';
    return true;
  });

  return (
    <div style={styles.page}>
      {toast.show && (
        <div style={{ ...styles.toast, background: toast.type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)' }}>
          {toast.message}
        </div>
      )}

      <div style={styles.container}>
        {/* Navigation Bar */}
        <nav style={styles.navbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.logoBadge}>🛠️</div>
            <div>
              <span style={styles.logoTitle}>SnapFix</span>
              <span style={styles.logoSubtitle}>Instant Incident Resolution System</span>
            </div>
          </div>
          <div>
            {user ? (
              <div style={styles.userInfo}>
                <div style={styles.userBadge}>
                  <span style={styles.userRoleTag}>{user.role.toUpperCase()}</span>
                  <span style={styles.userName}>{user.name}</span>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} style={styles.loginBtn}>
                🔐 Login / Register
              </button>
            )}
          </div>
        </nav>

        {/* Dashboard Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>📊</div>
            <div>
              <span style={{ ...styles.statNumber, color: '#38bdf8' }}>{tickets.length}</span>
              <span style={styles.statLabel}>Total Incidents</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>⏳</div>
            <div>
              <span style={{ ...styles.statNumber, color: '#fbbf24' }}>{pendingCount}</span>
              <span style={styles.statLabel}>Pending Action</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>✅</div>
            <div>
              <span style={{ ...styles.statNumber, color: '#34d399' }}>{resolvedCount}</span>
              <span style={styles.statLabel}>Resolved Cases</span>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <div style={styles.glassCard}>
          <div style={styles.cardHeader}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc', fontWeight: '700' }}>
              ✨ Raise a New Support Ticket
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Provide details for instant dispatch</span>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>SELECT CATEGORY</label>
              <div style={styles.grid2}>
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    style={{
                      ...styles.choiceBtn,
                      background: category === cat.name ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                      borderColor: category === cat.name ? '#6366f1' : '#1e293b',
                      color: category === cat.name ? '#818cf8' : '#94a3b8',
                      boxShadow: category === cat.name ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none'
                    }}
                  >
                    <span>{cat.icon}</span> <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>PRIORITY LEVEL</label>
              <div style={styles.grid3}>
                {priorities.map((p) => (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => setPriority(p.name)}
                    style={{
                      ...styles.choiceBtn,
                      background: priority === p.name ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.6)',
                      borderColor: priority === p.name ? p.color : '#1e293b',
                      color: priority === p.name ? p.color : '#94a3b8',
                      fontWeight: priority === p.name ? '700' : '500',
                      boxShadow: priority === p.name ? `0 0 10px ${p.color}44` : 'none'
                    }}
                  >
                    <span>{p.icon}</span> <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>PROBLEM TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Water leak under sink"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>LOCATION / ROOM NO.</label>
                <input
                  type="text"
                  placeholder="e.g. Hostel 3, Room 204"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" style={styles.submitBtn}>
              🚀 Dispatch Incident Ticket
            </button>
          </form>
        </div>

        {/* Ticket Feed */}
        <div style={{ marginTop: '32px' }}>
          <div style={styles.streamHeader}>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#f8fafc', fontWeight: '700' }}>📌 Incident Feed</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Live system ticket logs</span>
            </div>
            <div style={styles.filterGroup}>
              {['All', 'Pending', 'Resolved'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    ...styles.filterBtn,
                    background: filter === f ? '#6366f1' : 'transparent',
                    color: filter === f ? '#ffffff' : '#94a3b8',
                    fontWeight: filter === f ? '700' : '500'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div style={styles.emptyState}>No tickets found in this section.</div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket._id} style={styles.ticketCard}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f1f5f9' }}>
                    {ticket.title}
                  </span>
                  <div style={styles.ticketMeta}>
                    <span style={styles.metaBadge}>📁 {ticket.category}</span>
                    <span style={styles.metaBadge}>📍 {ticket.location}</span>
                    <span style={{ ...styles.metaBadge, color: ticket.priority === 'Urgent' ? '#f43f5e' : ticket.priority === 'Low' ? '#10b981' : '#f59e0b' }}>
                      🔥 {ticket.priority || 'Medium'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      ...styles.statusTag,
                      background: ticket.status === 'Resolved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: ticket.status === 'Resolved' ? '#34d399' : '#fbbf24',
                      borderColor: ticket.status === 'Resolved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    {ticket.status === 'Resolved' ? '✓ Resolved' : '⏳ Pending'}
                  </span>
                  {ticket.status === 'Pending' && user?.role === 'admin' && (
                    <button onClick={() => handleResolve(ticket._id)} style={styles.resolveBtn}>
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Auth Modal */}
        {isAuthModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc' }}>
                  {authMode === 'login' ? '🔑 Welcome Back' : '📝 Create Account'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                  {authMode === 'login' ? 'Sign in to access your dashboard' : 'Join FixIt Desk to report issues'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {authMode === 'register' && (
                  <>
                    <div>
                      <label style={styles.label}>FULL NAME</label>
                      <input type="text" placeholder="John Doe" value={authName} onChange={(e) => setAuthName(e.target.value)} style={styles.input} required />
                    </div>
                    <div>
                      <label style={styles.label}>ACCOUNT TYPE</label>
                      <select value={authRole} onChange={(e) => setAuthRole(e.target.value)} style={styles.input}>
                        <option value="user">User (Raise Tickets)</option>
                        <option value="admin">Admin (Manage & Resolve)</option>
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label style={styles.label}>EMAIL ADDRESS</label>
                  <input type="email" placeholder="name@example.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={styles.input} required />
                </div>
                <div>
                  <label style={styles.label}>PASSWORD</label>
                  <input type="password" placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={styles.input} required />
                </div>

                <button type="submit" style={{ ...styles.submitBtn, marginTop: '8px' }}>
                  {authMode === 'login' ? 'Sign In' : 'Register Account'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={styles.switchModeBtn}>
                  {authMode === 'login' ? "Don't have an account? Register" : "Already registered? Sign In"}
                </button>
              </div>
              <button onClick={() => { setIsAuthModalOpen(false); clearAuthFields(); }} style={styles.closeBtn}>Cancel</button>
            </div>
          </div>
        )}

        <footer style={styles.footer}>
          Designed & Built with ❤️ by <span style={{ color: '#818cf8', fontWeight: 'bold' }}>Mohammad Shad</span>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#070a12', color: '#f8fafc', padding: '16px', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', boxSizing: 'border-box' },
  container: { maxWidth: '720px', margin: '0 auto', width: '100%' },
  toast: { position: 'fixed', top: '24px', right: '24px', color: '#fff', padding: '12px 24px', borderRadius: '12px', zIndex: 1000, fontWeight: '600', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontSize: '0.9rem' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: '12px' },
  logoBadge: { background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '10px', borderRadius: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' },
  logoTitle: { fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px', display: 'block' },
  logoSubtitle: { fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '-2px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  userBadge: { background: 'rgba(30, 41, 59, 0.7)', border: '1px solid #334155', padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' },
  userRoleTag: { fontSize: '0.65rem', fontWeight: '800', background: '#6366f1', color: '#fff', padding: '2px 6px', borderRadius: '4px' },
  userName: { fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' },
  logoutBtn: { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  loginBtn: { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px', width: '100%' },
  statCard: { background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', padding: '14px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxSizing: 'border-box' },
  statIconWrapper: { fontSize: '1.4rem', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '10px', flexShrink: 0 },
  statNumber: { fontSize: '1.5rem', fontWeight: '800', display: 'block', lineHeight: '1.1' },
  statLabel: { fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' },
  glassCard: { background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(12px)', padding: '20px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', boxSizing: 'border-box' },
  cardHeader: { marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' },
  label: { fontSize: '0.68rem', color: '#818cf8', fontWeight: '800', letterSpacing: '0.6px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px' },
  choiceBtn: { border: '1px solid', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' },
  input: { width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', padding: '12px 14px', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' },
  submitBtn: { background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(99,102,241,0.3)', marginTop: '8px' },
  streamHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  filterGroup: { display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid #1e293b' },
  filterBtn: { border: 'none', padding: '6px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.78rem' },
  ticketCard: { background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '14px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  ticketMeta: { display: 'flex', gap: '8px', fontSize: '0.78rem', marginTop: '2px', flexWrap: 'wrap' },
  metaBadge: { color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '6px' },
  statusTag: { fontSize: '0.75rem', padding: '5px 12px', borderRadius: '8px', fontWeight: '700', border: '1px solid' },
  resolveBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700' },
  emptyState: { textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.88rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: '16px' },
  modalCard: { background: '#0f172a', padding: '24px', borderRadius: '20px', width: '100%', maxWidth: '420px', border: '1px solid #1e293b', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', boxSizing: 'border-box' },
  switchModeBtn: { background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' },
  closeBtn: { background: 'transparent', color: '#64748b', border: 'none', width: '100%', padding: '8px', borderRadius: '8px', marginTop: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  footer: { textAlign: 'center', marginTop: '48px', fontSize: '0.82rem', color: '#475569' }
};

export default App;