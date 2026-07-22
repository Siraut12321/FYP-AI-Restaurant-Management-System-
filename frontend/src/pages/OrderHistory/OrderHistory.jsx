import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../../components/Loading/Spinner';
import orderService from '../../services/orderService';

const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    orderService.getMyOrders()
      .then((response) => {
        if (active) setOrders(response.data || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.status === 401
          ? 'Your session has expired. Please log in again.'
          : err.response?.data?.message || 'Unable to load your order history.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>
        <h1>Order History</h1>
        <p role='alert'>{error}</p>
        <Link to='/login'>Log in</Link>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>
      <header style={{ marginBottom: 28 }}>
        <h1>Order History</h1>
        <p>Review your previous orders and follow their progress.</p>
      </header>

      {orders.length === 0 ? (
        <div>
          <h2>No orders yet</h2>
          <p>Your completed orders will appear here.</p>
          <Link to='/menu'>Browse the menu</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {orders.map((order) => (
            <article key={order._id} style={{ border: '1px solid #ddd', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0 }}>Order #{order._id.slice(-8).toUpperCase()}</h2>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
                <strong>{order.orderStatus}</strong>
              </div>
              <p>{order.orderItems?.map((item) => `${item.dishName} x${item.quantity}`).join(', ')}</p>
              <p>Total: {order.totalAmount} | Payment: {order.paymentMethod}</p>
              <Link to={`/orders/${order._id}`}>View order details</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrderHistory;
