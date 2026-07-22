import { motion } from 'framer-motion';
import { MdTrendingUp, MdTrendingDown, MdRemove } from 'react-icons/md';
import styles from './DashboardCard.module.css';

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: 'easeOut', delay: i * 0.07 },
  }),
};

/* sparkData: array of 0–100 values for the mini bar chart */
function Sparkline({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div className={styles.sparkline}>
      {data.map((v, i) => (
        <div
          key={i}
          className={styles.bar}
          style={{ height: `${(v / max) * 100}%`, background: color }}
        />
      ))}
    </div>
  );
}

function DashboardCard({ icon, label, value, change, iconBg, iconColor, sparkData, index = 0 }) {
  const direction = change?.startsWith('+') ? 'up' : change?.startsWith('-') ? 'down' : 'neutral';

  return (
    <motion.div
      className={styles.card}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.015 }}
    >
      <div className={styles.topRow}>
        <div className={styles.iconWrap} style={{ background: iconBg }}>
          <span style={{ color: iconColor, display: 'flex' }}>{icon}</span>
        </div>

        {change && (
          <span className={`${styles.changeBadge} ${styles[direction]}`}>
            {direction === 'up'   && <MdTrendingUp />}
            {direction === 'down' && <MdTrendingDown />}
            {direction === 'neutral' && <MdRemove />}
            {change}
          </span>
        )}
      </div>

      <div>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>

      {sparkData && <Sparkline data={sparkData} color={iconColor} />}
    </motion.div>
  );
}

export default DashboardCard;
