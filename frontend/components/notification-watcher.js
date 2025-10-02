"use client"

import { useEffect, useRef } from "react"
import { useAccount } from "wagmi"
import { useNotifications } from "@/components/notification-toast"

/**
 * Notification Watcher Component
 * Polls the notifications API and shows toasts for the connected wallet
 * Only displays notifications where connected wallet matches the recipient address
 */
export function NotificationWatcher() {
  const { address: userAddress, isConnected } = useAccount()
  const { showNotification } = useNotifications()
  const shownNotifications = useRef(new Set())
  const pollingInterval = useRef(null)

  useEffect(() => {
    // Only poll if wallet is connected
    if (!isConnected || !userAddress) {
      // Clear polling when disconnected
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
        pollingInterval.current = null
      }
      return
    }

    // Fetch and display notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications?walletAddress=${userAddress}`)
        const data = await response.json()

        if (data.success && data.hasNotification && data.notification) {
          // API now returns single latest notification
          const notif = data.notification;
          
          // Check if this notification should be shown
          const isRecipient = notif.to?.toLowerCase() === userAddress.toLowerCase()
          const notShown = !shownNotifications.current.has(notif.id)
          const isPending = notif.status === 'pending'
          
          // Only show if all conditions are met
          if (isRecipient && notShown && isPending) {
            const newNotifications = [notif];

            // Show each new notification as a toast (they persist until paid)
            for (const notif of newNotifications) {
            showNotification({
              id: notif.id, // Pass the notification ID so it can be tracked
              type: notif.type || 'payment_request',
              title: notif.title || 'Payment Request Received',
              message: notif.message,
              amount: notif.amount,
              tokenSymbol: notif.tokenSymbol,
              fromName: notif.fromName,
              fromAddress: notif.from,
            })

              // Mark as shown (so we don't show it again)
              shownNotifications.current.add(notif.id)
              
              // Note: We DON'T delete from backend here
              // It will only be deleted when user pays (in handlePayNow)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    // Fetch immediately
    fetchNotifications()

    // Poll every 5 seconds to check for new notifications
    pollingInterval.current = setInterval(fetchNotifications, 5000)

    // Cleanup on unmount or wallet change
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [userAddress, isConnected, showNotification])

  // Clear shown notifications when wallet changes
  useEffect(() => {
    shownNotifications.current.clear()
  }, [userAddress])

  // This component doesn't render anything visible
  return null
}

