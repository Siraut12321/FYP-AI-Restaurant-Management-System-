import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Spinner from '../../components/Loading/Spinner';
import orderService from '../../services/orderService';

const TRACKING_STEPS = ['Pending', 'Preparing', 'Ready', 'Delivered'];

const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([orderService.getOrderById(id), orderService.getOrderTracking(id)])
      .then(([orderResponse, trackingResponse]) => {
        if (!active) return;
        setOrder(orderResponse.data);
        setTracking(trackingResponse.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.status === 401 || err.response?.status === 403
          ? 'You are not authorized to view this order.'
          : err.response?.data?.message || 'Unable to load order details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  if (loading) return <Spinner />;

  if (error || !order || !tracking) {
    return (
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>
        <h1>Order Details</h1>
        <p role='alert'>{error || 'Order not found.'}</p>
        <Link to='/orders'>Back to order history</Link>
      </section>
    );
  }

  const currentIndex = TRACKING_STEPS.indexOf(tracking.currentStatus);

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>
      <Link to='/orders'>Back to order history</Link>
      <header style={{ margin: '24px 0' }}>
        <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
        <p>{formatDate(order.createdAt)}</p>
      </header>

      <section aria-label='Order tracking' style={{ border: '1px solid #ddd', padding: 20, marginBottom: 24 }}>
        <h2>Order Tracking</h2>
        <p>Current status: <strong>{tracking.currentStatus}</strong></p>
        <p>
          Estimated preparation time:{' '}
          {tracking.estimatedPreparationTime ? `${tracking.estimatedPreparationTime} minutes` : 'Not available'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          {TRACKING_STEPS.map((step, index) => {
            const completed = tracking.currentStatus !== 'Cancelled' && index <= currentIndex;
            return (
              <div key={step} style={{ color: completed ? '#16803c' : '#777', fontWeight: completed ? 700 : 400 }}>
                <span aria-hidden='true'>{completed ? '●' : '○'}</span> {step}
              </div>
            );
          })}
        </div>
        {tracking.isCancelled && <p role='alert'>This order has been cancelled.</p>}
      </section>

      <section>
        <h2>Items</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {order.orderItems.map((item) => (
            <article key={`${item.menuItem?._id || item.dishName}-${item.quantity}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <strong>{item.dishName}</strong>
                <p>Price: {item.price} | Quantity: {item.quantity}</p>
              </div>
              <strong>Subtotal: {item.subtotal}</strong>
            </article>
          ))}
        </div>
        <p style={{ marginTop: 24 }}><strong>Total: {order.totalAmount}</strong></p>
        <p>Payment method: {order.paymentMethod}</p>
      </section>
    </section>
  );
}

export default OrderDetails;
