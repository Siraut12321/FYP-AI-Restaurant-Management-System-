import { useContext, useState } from 'react';
import styles from '../../styles/CartPage.module.css';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import orderService from '../../services/orderService';

const PHONE_RE = /^03[0-9]{9}$/;

const emptyAddress = { fullName: '', phone: '', address: '', city: '' };

function Cart() {
  const { cart, updateQty, removeItem, totalItems, totalPrice, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [showForm, setShowForm]       = useState(false);
  const [address, setAddress]         = useState(emptyAddress);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [phoneError, setPhoneError]   = useState('');
  const [successMsg, setSuccessMsg]   = useState('');

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      if (!/^[0-9]*$/.test(value) || value.length > 11) return;
      setPhoneError('');
    }
    if (name === 'city' && !/^[a-zA-Z\s]*$/.test(value)) return;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    setError('');
    if (!user) { setError('Please log in to place an order.'); return; }

    const { fullName, phone, address: addr, city } = address;
    if (!fullName || !phone || !addr || !city) {
      setError('Please fill in all shipping address fields.');
      return;
    }
    if (!PHONE_RE.test(phone)) {
      setPhoneError('Phone must be 11 digits starting with 03 (e.g. 03001234567)');
      return;
    }

    const orderItems = cart.map((it) => ({
      menuItem: it.id,
      quantity: it.qty,
    }));

    setLoading(true);
    try {
      await orderService.placeOrder({ orderItems, shippingAddress: address, paymentMethod: 'Cash on Delivery' });
      clearCart();
      setShowForm(false);
      setAddress(emptyAddress);
      setSuccessMsg('🎉 Order placed successfully! We will start preparing your food.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className={styles.page}>
        <div className={styles.summary} style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
          <h2>{successMsg}</h2>
          <button className={styles.checkout} onClick={() => setSuccessMsg('')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className={styles.grid}>
          {/* ── Cart Items ── */}
          <div className={styles.items}>
            {cart.map((it) => (
              <div key={it.id} className={styles.item}>
                <img src={it.image} alt={it.name} />
                <div className={styles.info}>
                  <h3>{it.name}</h3>
                  <p>{it.description}</p>
                  <div className={styles.controls}>
                    <button onClick={() => updateQty(it.id, it.qty - 1)}>-</button>
                    <span>{it.qty}</span>
                    <button onClick={() => updateQty(it.id, it.qty + 1)}>+</button>
                    <button className={styles.remove} onClick={() => removeItem(it.id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className={styles.price}>{it.price}</div>
              </div>
            ))}
          </div>

          {/* ── Order Summary + Checkout ── */}
          <aside className={styles.summary}>
            <h3>Order Summary</h3>
            <p>Items: {totalItems}</p>
            <p>Total: ₨ {Math.round(totalPrice)}</p>

            {!showForm ? (
              <>
                <button className={styles.checkout} onClick={() => setShowForm(true)}>
                  Checkout
                </button>
                <button className={styles.clear} onClick={clearCart}>
                  Clear Cart
                </button>
              </>
            ) : (
              <div className={styles.checkoutForm}>
                <h4>Shipping Address</h4>

                {['fullName', 'phone', 'address', 'city'].map((field) => (
                  <div key={field}>
                    <input
                      name={field}
                      placeholder={
                        field === 'fullName' ? 'Full Name'
                        : field === 'phone'  ? 'Phone Number (03XXXXXXXXX)'
                        : field === 'address'? 'Street Address'
                        : 'City'
                      }
                      value={address[field]}
                      onChange={handleAddressChange}
                      className={styles.input}
                      inputMode={field === 'phone' ? 'numeric' : undefined}
                    />
                    {field === 'phone' && phoneError && (
                      <p className={styles.error}>{phoneError}</p>
                    )}
                  </div>
                ))}

                <h4>Payment Method</h4>
                <p style={{ margin: '4px 0 12px', fontWeight: 600 }}>Cash on Delivery</p>

                {error && <p className={styles.error}>{error}</p>}

                <button
                  className={styles.checkout}
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>

                <button
                  className={styles.clear}
                  onClick={() => { setShowForm(false); setError(''); }}
                >
                  Cancel
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart;
