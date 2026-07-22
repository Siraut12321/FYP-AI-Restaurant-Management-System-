import { useState } from 'react';
import styles from '../../styles/ui.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function TextInput({ value, onChange, placeholder, type = 'text', showToggle = false, ariaLabel, ...rest }) {
  const [visible, setVisible] = useState(false);
  const inputType = type === 'password' && showToggle ? (visible ? 'text' : 'password') : type;

  return (
    <div className={styles.field}>
      <input
        className={styles.input}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={inputType}
        aria-label={ariaLabel}
        {...rest}
      />
      {type === 'password' && showToggle && (
        <button type='button' className={styles.eyeToggle} onClick={() => setVisible((v) => !v)} aria-label='Toggle password visibility'>
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      )}
    </div>
  );
}

export default TextInput;
