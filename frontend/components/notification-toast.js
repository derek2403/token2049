"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Bell, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Create context for notifications
const NotificationContext = createContext()

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}

/**
 * Notification Provider
 * Manages toast notifications across the app
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const showNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 8000)
    
    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      <NotificationToastContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  )
}

/**
 * Toast Container
 * Displays notifications at the top-right of the screen
 */
function NotificationToastContainer({ notifications, onRemove }) {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => onRemove(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * Individual Toast Notification
 */
function NotificationToast({ notification, onClose }) {
  const { type, title, message, amount, tokenSymbol, fromName } = notification

  const getIcon = () => {
    switch (type) {
      case 'payment_request':
        return <Bell className="h-5 w-5 text-orange-400" />
      case 'payment_sent':
        return <CheckCircle2 className="h-5 w-5 text-green-400" />
      default:
        return <Bell className="h-5 w-5 text-blue-400" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'payment_request':
        return 'from-orange-900/30 to-yellow-900/30 border-orange-500/50'
      case 'payment_sent':
        return 'from-green-900/30 to-emerald-900/30 border-green-500/50'
      default:
        return 'from-blue-900/30 to-indigo-900/30 border-blue-500/50'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="pointer-events-auto w-96 max-w-[calc(100vw-2rem)]"
    >
      <Card className={`bg-gradient-to-br ${getColors()} backdrop-blur-lg border p-4`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-sm font-semibold text-white mb-1">
                {title}
              </p>
            )}
            
            <p className="text-sm text-neutral-200">
              {message}
            </p>
            
            {amount && tokenSymbol && (
              <p className="text-base font-bold text-white mt-2">
                {amount} {tokenSymbol}
              </p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-6 w-6 text-neutral-400 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

