// src/components/Toast.jsx
import { useEffect } from 'react'
import { FiAlertCircle, FiX } from 'react-icons/fi'

export function Toast({ message, type = 'error', onClose, autoClose = 5000 }) {
  useEffect(() => {
    if (!autoClose) return
    const timer = setTimeout(onClose, autoClose)
    return () => clearTimeout(timer)
  }, [autoClose, onClose])

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <FiAlertCircle className="toast-icon" size={18} />
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        <FiX size={16} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
          autoClose={toast.autoClose}
        />
      ))}
    </div>
  )
}
