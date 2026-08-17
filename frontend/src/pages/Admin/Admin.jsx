import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdDashboard, MdShoppingCart, MdSmartToy, MdBarChart, MdSettings, MdPeople } from 'react-icons/md';

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.28, delay: i * 0.07, ease: 'easeOut' } }),
};

function Admin() {
  const menuItems = [
    { icon: <MdDashboard />, label: 'Dashboard', to: '/admin/dashboard', desc: 'View key metrics and analytics' },
    { icon: <MdShoppingCart />, label: 'Orders', to: '/admin/orders', desc: 'Manage all customer orders' },
    { icon: <MdSmartToy />, label: 'AI Orders', to: '/admin/ai-orders', desc: 'Voice/AI placed orders' },
    { icon: <MdBarChart />, label: 'Analytics', to: '/admin/analytics', desc: 'Revenue and trends' },
    { icon: <MdPeople />, label: 'Customers', to: '/admin/customers', desc: 'Manage customer profiles' },
    { icon: <MdSettings />, label: 'Settings', to: '/admin/settings', desc: 'Restaurant configuration' },
  ];

  return (
    <div style={{ padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>🌶️ Hot & Spicy Admin</h1>
        <p style={{ color: '#a1a1aa', fontSize: '0.95rem', margin: 0 }}>Manage your restaurant operations, orders, and analytics.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
      }}>
        {menuItems.map((item, i) => (
          <motion.div
            key={item.label}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <Link
              to={item.to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: '24px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: 16,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                background: 'rgba(244,197,66,0.15)',
                borderRadius: 12,
                color: '#F4C542',
                fontSize: '1.5rem',
              }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#efe8df', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{item.desc}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
