import styles from '../../styles/ui.module.css';

function Button({ children, variant = 'primary', className = '', ...rest }) {
  const cls = `${styles.button} ${styles[variant] || ''} ${className}`.trim();
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

export default Button;
