import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, MapPin, Bell, Clock } from 'lucide-react';
import { useEmergencyStore } from '../store/useEmergencyStore';

export default function SmartAlertsSheet({ open, onOpenChange }) {
  const emergencyAlerts = useEmergencyStore(state => state.emergencyAlerts);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-canvas border-l border-hairline-soft z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-hairline-soft">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-ink" />
                <h2 className="text-title-md font-body font-medium text-ink">Alerts</h2>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 text-muted-soft hover:text-muted hover:bg-surface-soft rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {emergencyAlerts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-muted-soft" />
                  </div>
                  <p className="text-body-sm text-muted">No alerts yet</p>
                  <p className="text-caption text-muted-soft mt-1">You'll see notifications here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emergencyAlerts.map((alert, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="card-cream p-4 border-l-4 border-l-error"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 text-error" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm font-medium text-ink">{alert.message || 'Emergency alert'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {alert.location && (
                              <span className="text-caption text-muted-soft flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {alert.location}
                              </span>
                            )}
                            <span className="text-caption text-muted-soft flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
