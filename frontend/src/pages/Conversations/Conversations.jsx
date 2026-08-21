import { useEffect, useState } from 'react';
import api from '../../api/api';
import styles from './Conversations.module.css';

function formatDate(value) {
  if (!value) return 'No activity';
  return new Date(value).toLocaleString();
}

function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/conversations')
      .then(({ data }) => setConversations(data.data?.conversations || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load conversations.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.state}>Loading conversations...</div>;
  if (error) return <div className={`${styles.state} ${styles.error}`}>{error}</div>;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>AI Conversations</h1>
          <p>Review customer conversations and their related orders.</p>
        </div>
      </div>
      {conversations.length === 0 ? (
        <div className={styles.state}>No conversations yet.</div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.list}>
            {conversations.map((conversation) => (
              <button
                type="button"
                key={conversation._id}
                className={`${styles.item} ${selected?._id === conversation._id ? styles.active : ''}`}
                onClick={() => setSelected(conversation)}
              >
                <strong>{conversation.title || 'New Conversation'}</strong>
                <span>{conversation.user?.name || 'Customer'} · {conversation.user?.email || 'No email'}</span>
                <small>{formatDate(conversation.lastMessageAt)} · {conversation.status}</small>
              </button>
            ))}
          </div>
          <section className={styles.detail}>
            {!selected ? <p className={styles.state}>Select a conversation.</p> : (
              <>
                <h2>{selected.title || 'New Conversation'}</h2>
                <p className={styles.meta}>{selected.user?.name} · {selected.user?.email} · Last activity {formatDate(selected.lastMessageAt)}</p>
                {selected.orderId && <p className={styles.meta}>Order: {selected.orderId}</p>}
                <div className={styles.messages}>
                  {selected.messages?.map((message, index) => (
                    <article key={`${selected._id}-${index}`} className={message.role === 'user' ? styles.user : styles.assistant}>
                      <strong>{message.role === 'user' ? 'Customer' : 'AI Assistant'}</strong>
                      <p>{message.content}</p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Conversations;
