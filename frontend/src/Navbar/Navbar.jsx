import { NavLink, Link } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import { useContext } from 'react';
import { FiShoppingCart, FiUser, FiHeart, FiList, FiLogOut } from 'react-icons/fi';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { totalItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>Hot & Spicy</div>
      <nav className={styles.menu}>
        <NavLink to='/' className={({isActive}) => isActive ? styles.active : ''}>Home</NavLink>
        <NavLink to='/menu' className={({isActive}) => isActive ? styles.active : ''}>Menu</NavLink>
        <NavLink to='/about' className={({isActive}) => isActive ? styles.active : ''}>About</NavLink>
        <NavLink to='/contact' className={({isActive}) => isActive ? styles.active : ''}>Contact</NavLink>
      </nav>
      <div className={styles.actions}>
        <Link to='/cart' className={styles.cartLink} aria-label="View cart">
          <FiShoppingCart className={styles.icon} />
          <span className={styles.cartText}>Cart {totalItems > 0 ? `(${totalItems})` : ''}</span>
        </Link>
        {user ? (
          <>
            {user.role === 'customer' && (
              <Link to='/profile' className={styles.iconLink} aria-label="Profile">
                <FiUser className={styles.icon} />
                <span>Profile</span>
              </Link>
            )}
            {user.role === 'customer' && (
              <Link to='/orders' className={styles.iconLink} aria-label="Orders">
                <FiList className={styles.icon} />
                <span>Orders</span>
              </Link>
            )}
            {user.role === 'customer' && (
              <Link to='/favorites' className={styles.iconLink} aria-label="Favorites">
                <FiHeart className={styles.icon} />
                <span>Favorites</span>
              </Link>
            )}
            <span className={styles.userName}>Hi, {user.name}</span>
            <button onClick={logout} className={styles.buttonOutline} aria-label="Logout">
              <FiLogOut className={styles.icon} />
              <span>Logout</span>
            </button>
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
