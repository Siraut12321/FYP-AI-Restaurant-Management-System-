import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/VoiceAssistant.module.css';

function VoiceAssistant() {
  const [status, setStatus] = useState('ready'); // ready | listening | thinking | speaking | error
  const timers = useRef([]);

  useEffect(() => {
    return () => {
      // cleanup timers on unmount
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
    };
  }, []);

  function clearTimers() {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }

  function startInteraction() {
    if (status === 'listening' || status === 'thinking') return;
    setStatus('listening');

    // simulate listening -> thinking -> speaking -> ready
    const t1 = setTimeout(() => setStatus('thinking'), 3000);
    const t2 = setTimeout(() => setStatus('speaking'), 5200);
    const t3 = setTimeout(() => setStatus('ready'), 7600);
    timers.current.push(t1, t2, t3);
  }

  function stopInteraction() {
    clearTimers();
    setStatus('ready');
  }

  const statusLabel = {
    ready: 'Ready',
    listening: 'Listening',
    thinking: 'Thinking',
    speaking: 'Speaking',
    error: 'Connection Error',
  }[status] || 'Ready';

  return (
    <section className={styles.assistantSection}>
      <div className={styles.assistantCard}>
        <div className={styles.header}>
          <motion.div
            className={styles.orb}
            data-status={status}
            aria-hidden
            animate={(() => {
              if (status === 'listening') return { scale: [1, 1.08, 1], boxShadow: '0 0 60px rgba(126,243,166,0.6)' };
              if (status === 'thinking') return { scale: [1, 1.03, 1], boxShadow: '0 0 40px rgba(255,209,102,0.5)' };
              if (status === 'speaking') return { scale: [1, 1.12, 1], boxShadow: '0 0 64px rgba(255,140,66,0.6)' };
              return { scale: 1, boxShadow: '0 0 32px rgba(255,209,102,0.55)' };
            })()}
            transition={{ duration: 0.9, repeat: status === 'ready' ? 0 : Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <div>
            <h2>AI Voice Assistant</h2>
            <p>Ready to listen to your Urdu food order.</p>
          </div>
        </div>

        <div className={styles.status}>
          Status: <span className={styles.statusValue} data-status={status}>{statusLabel}</span>
        </div>

        <div className={styles.conversationWindow}>
          <div className={styles.message}>AI: آپ کیسے مدد کر سکتا ہوں؟</div>
          <div className={styles.userMessage}>User: رمضان سپیشل آئٹم دکھائیں</div>
        </div>

        <div className={styles.controls}>
          <button
            className={styles.microphoneButton}
            onClick={startInteraction}
            aria-pressed={status === 'listening'}
            aria-label="Toggle voice assistant"
          >
            {status === 'listening' ? '🎤 Listening...' : '🎙️ Start Listening'}
          </button>

          <button
            className={styles.smallButton}
            onClick={stopInteraction}
            aria-label="Stop voice assistant"
          >
            Stop
          </button>
        </div>

        <div className={styles.waveform} aria-hidden data-status={status}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              style={{ display: 'inline-block' }}
              animate={(() => {
                if (status === 'listening') {
                  const seq = [6, 18, 8, 22, 6];
                  return { height: [seq[i % seq.length], seq[(i + 2) % seq.length], seq[(i + 4) % seq.length]] };
                }
                if (status === 'speaking') {
                  const seq = [10, 26, 14, 28, 10];
                  return { height: [seq[i % seq.length], seq[(i + 1) % seq.length], seq[(i + 3) % seq.length]] };
                }
                // idle/ready/thinking -> subtle motion
                return { height: [6, 10, 6] };
              })()}
              transition={{ duration: 0.9, repeat: Infinity, repeatType: 'loop', delay: i * 0.06, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default VoiceAssistant;
