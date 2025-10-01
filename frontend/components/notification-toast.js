"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Bell, CheckCircle2, Send } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAccount, useWriteContract, useSendTransaction } from "wagmi"
import { executeTokenTransfer } from "@/lib/llmActions/executeTransfer"

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
    const id = notification.id || Date.now() + Math.random()
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Only auto-remove non-payment-request notifications after 8 seconds
    if (notification.type !== 'payment_request') {
      setTimeout(() => {
        removeNotification(id)
      }, 8000)
    }
    // Payment requests stay until user dismisses or pays
    
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
  const { id: notificationId, type, title, message, amount, tokenSymbol, fromName, fromAddress } = notification
  const { address: userAddress, chain } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { sendTransactionAsync } = useSendTransaction()
  const { showNotification } = useNotifications()
  const [isPaying, setIsPaying] = useState(false)

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

  const handlePayNow = async () => {
    if (!fromAddress || !amount || !tokenSymbol) {
      console.error('Missing payment information')
      return
    }

    setIsPaying(true)

    try {
      const result = await executeTokenTransfer({
        destinationAddress: fromAddress,
        amount: amount,
        tokenSymbol: tokenSymbol,
        writeContract: writeContractAsync,
        sendTransaction: sendTransactionAsync,
        chainId: chain?.id || 44787,
        userAddress,
      })

      if (result.success) {
        // Remove notification from backend (mark as paid/completed)
        try {
          await fetch('/api/notifications', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notificationId }),
          })
        } catch (error) {
          console.error('Failed to remove notification:', error)
        }
        
        // Close current notification
        onClose()
        
        // Show success notification
        showNotification({
          type: 'payment_sent',
          title: 'Payment Sent Successfully! 🎉',
          message: `Sent ${amount} ${tokenSymbol} to ${fromName}`,
          amount: amount,
          tokenSymbol: tokenSymbol,
        })
        
        console.log('Payment successful:', result)
      } else {
        console.error('Payment failed:', result.error)
        
        // Show error as notification instead of alert
        showNotification({
          type: 'payment_request',
          title: 'Payment Failed',
          message: result.userRejected ? 'Transaction was cancelled' : (result.error || 'Failed to process payment'),
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      
      // Show error notification
      showNotification({
        type: 'payment_request',
        title: 'Payment Error',
        message: 'Failed to process payment. Please try again.',
      })
    } finally {
      setIsPaying(false)
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

            {/* Pay Now button for payment requests */}
            {type === 'payment_request' && fromAddress && (
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white text-xs px-3 py-1 h-7"
                  onClick={handlePayNow}
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-1" />
                      Pay Now
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-neutral-300 hover:text-white text-xs px-2 py-1 h-7"
                  onClick={async () => {
                    // Remove from backend when dismissed
                    try {
                      await fetch('/api/notifications', {
                        method: 'DELETE',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ notificationId }),
                      })
                    } catch (error) {
                      console.error('Failed to remove notification:', error)
                    }
                    onClose()
                  }}
                >
                  Dismiss
                </Button>
              </div>
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

