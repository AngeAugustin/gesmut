import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, severity = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, severity, duration };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Méthodes de convenance
  const success = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  const value = {
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast, index) => {
        const getIcon = () => {
          switch (toast.severity) {
            case 'success':
              return <CheckCircleIcon sx={{ color: '#10b981', fontSize: '20px' }} />;
            case 'error':
              return <ErrorIcon sx={{ color: '#10b981', fontSize: '20px' }} />;
            case 'warning':
              return <WarningIcon sx={{ color: '#10b981', fontSize: '20px' }} />;
            case 'info':
              return <InfoIcon sx={{ color: '#10b981', fontSize: '20px' }} />;
            default:
              return <InfoIcon sx={{ color: '#10b981', fontSize: '20px' }} />;
          }
        };

        return (
          <Snackbar
            key={toast.id}
            open={true}
            autoHideDuration={toast.duration}
            onClose={() => removeToast(toast.id)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{ bottom: `${24 + index * 70}px !important` }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                minWidth: '300px',
                maxWidth: '500px',
              }}
            >
              {getIcon()}
              <Box sx={{ flex: 1, color: '#000000', fontSize: '14px', fontWeight: 400 }}>
                {toast.message}
              </Box>
              <IconButton
                size="small"
                onClick={() => removeToast(toast.id)}
                sx={{
                  color: '#6b7280',
                  padding: '4px',
                  '&:hover': {
                    color: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: '18px' }} />
              </IconButton>
            </Box>
          </Snackbar>
        );
      })}
    </ToastContext.Provider>
  );
};

