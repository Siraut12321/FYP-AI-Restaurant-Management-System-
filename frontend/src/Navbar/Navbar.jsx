import { Link } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { totalItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>UrduAI Bistro</div>
      <nav className={styles.menu}>
        <Link to='/'>Home</Link>
        <Link to='/menu'>Menu</Link>
        <Link to='/deals'>Deals</Link>
        <Link to='/about'>About</Link>
        <Link to='/contact'>Contact</Link>
      </nav>
      <div className={styles.actions}>
        <Link to='/cart' className={styles.cartLink}>Cart {totalItems > 0 ? `(${totalItems})` : ''}</Link>
        {user ? (
          <>
            <span className={styles.userName}>Hi, {user.name}</span>
            <button onClick={logout} className={styles.buttonOutline}>Logout</button>
          </>
        ) : (
          <>
            <Link className={styles.button} to='/login'>Login</Link>
            <Link className={styles.buttonOutline} to='/register'>Register</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
