import { motion } from 'framer-motion';
import { MdBarChart } from 'react-icons/md';

const panel = {
  background: '#181818', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20, padding: '48px 32px', textAlign: 'center',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
};

function Analytics() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Analytics</h1>
        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: 4 }}>Revenue, orders and customer growth insights.</p>
      </div>
      <div style={panel}>
        <MdBarChart style={{ fontSize: '3rem', color: '#F4C542', opacity: 0.5 }} />
        <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Full Analytics page coming soon — connect backend to populate charts.</p>
      </div>
    </motion.div>
  );
}

export default Analytics;
