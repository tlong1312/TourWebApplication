import { useEffect } from "react";
import styles from './Alert.module.css';

export default function Alert({ message, type = 'error', onClose, autoClose = true, autoCloseMs = 5000 }) {
  useEffect(() => {
    if (!message) return;
    if (autoClose && onClose) {
      const id = setTimeout(() => onClose(), autoCloseMs);
      return () => clearTimeout(id);
    }
  }, [message, autoClose, autoCloseMs, onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.alert} ${styles[type]}`} role="alert">
      <div className={styles.message}>{message}</div>
      {onClose && (
        <button className={styles.close} onClick={onClose} aria-label="Close alert">
          ×
        </button>
      )}
    </div>
  );
}
