import { useEffect, useRef, useState } from 'react';
import { MdAdd, MdChat, MdDelete, MdMenu, MdClose } from 'react-icons/md';
import styles from './ChatSidebar.module.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ChatSidebar({
  conversations,
  activeConvId,
  loading,
  error,
  onNewChat,
  onSelectConv,
  onDeleteConv,
}) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (open && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (id) => {
    onSelectConv(id);
    setOpen(false);
  };

  const sidebarContent = (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>Conversations</span>
        <button
          type="button"
          className={styles.newChatBtn}
          onClick={() => { onNewChat(); setOpen(false); }}
          title="Start a new conversation"
        >
          <MdAdd size={18} />
          New Chat
        </button>
      </div>

      <div className={styles.convList}>
        {loading && (
          <div className={styles.stateMsg}>Loading conversations...</div>
        )}
        {!loading && error && (
          <div className={`${styles.stateMsg} ${styles.errorMsg}`}>
            Unable to load your conversations. Please try again.
          </div>
        )}
        {!loading && !error && conversations.length === 0 && (
          <div className={styles.stateMsg}>
            No conversations yet. Start a new chat to place an order.
          </div>
        )}
        {!loading && conversations.map((conv) => {
          const id = conv.id || conv._id;
          return (
            <div
              key={id}
              className={`${styles.convItem} ${id === activeConvId ? styles.convItemActive : ''}`}
              onClick={() => handleSelect(id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(id)}
            >
              <MdChat className={styles.convIcon} size={15} />
              <div className={styles.convInfo}>
                <span className={styles.convTitle}>{conv.title || 'New Conversation'}</span>
                <span className={styles.convMeta}>
                  {formatDate(conv.updatedAt || conv.lastMessageAt || conv.createdAt)}
                  {conv.status === 'completed' && (
                    <span className={styles.completedBadge}>Completed</span>
                  )}
                </span>
              </div>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={(e) => { e.stopPropagation(); onDeleteConv(id); }}
                title="Delete conversation"
                aria-label="Delete conversation"
              >
                <MdDelete size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className={styles.mobileToggle}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle chat history"
      >
        {open ? <MdClose size={20} /> : <MdMenu size={20} />}
        <span>Chats</span>
      </button>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <div
        ref={drawerRef}
        className={`${styles.sidebarWrapper} ${open ? styles.sidebarOpen : ''}`}
      >
        {sidebarContent}
      </div>
    </>
  );
}

export default ChatSidebar;
