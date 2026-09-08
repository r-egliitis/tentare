import { useEffect, useRef } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  /** Auto-dismiss delay. Defaults to 5s. */
  durationMs?: number;
}

export function Toast({
  message,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = 5000,
}: ToastProps) {
  // Keep the latest onDismiss without making it a timer dependency, so a
  // parent re-render (which may give onDismiss a new identity) doesn't
  // restart the auto-dismiss countdown. Updated in an effect, not during
  // render, since mutating a ref while rendering isn't safe.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return (
    <div className={styles.toast} role="status">
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={() => {
            onAction();
            onDismiss();
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
