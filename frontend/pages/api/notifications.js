import fs from 'fs';
import path from 'path';

/**
 * API endpoint to manage notifications
 * GET: Fetch notifications for a specific wallet address
 * POST: Save new notifications
 * DELETE: Remove a notification by ID
 */
export default function handler(req, res) {
  const notificationsPath = path.join(process.cwd(), 'data', 'notifications.json');

  if (req.method === 'GET') {
    try {
      // Read notifications from file
      let notifications = [];
      try {
        const data = fs.readFileSync(notificationsPath, 'utf8');
        notifications = JSON.parse(data);
      } catch (error) {
        notifications = [];
      }

      // Filter by wallet address if provided
      const { walletAddress } = req.query;
      if (walletAddress) {
        notifications = notifications.filter(
          n => n.to?.toLowerCase() === walletAddress.toLowerCase()
        );
      }

      res.status(200).json({ success: true, notifications });
    } catch (error) {
      console.error('Error reading notifications:', error);
      res.status(500).json({ success: false, error: 'Failed to read notifications' });
    }
  } else if (req.method === 'POST') {
    try {
      // Read existing notifications
      let notifications = [];
      try {
        const data = fs.readFileSync(notificationsPath, 'utf8');
        notifications = JSON.parse(data);
      } catch (error) {
        notifications = [];
      }

      // Add new notifications from request body
      const newNotifications = req.body.notifications || [];
      
      // Append new notifications
      notifications = [...notifications, ...newNotifications];

      // Write back to file
      fs.writeFileSync(notificationsPath, JSON.stringify(notifications, null, 2));

      res.status(200).json({ 
        success: true, 
        message: 'Notifications saved successfully',
        count: newNotifications.length 
      });
    } catch (error) {
      console.error('Error saving notifications:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to save notifications' 
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Read existing notifications
      let notifications = [];
      try {
        const data = fs.readFileSync(notificationsPath, 'utf8');
        notifications = JSON.parse(data);
      } catch (error) {
        notifications = [];
      }

      // Remove notification by ID
      const { notificationId } = req.body;
      notifications = notifications.filter(n => n.id !== notificationId);

      // Write back to file
      fs.writeFileSync(notificationsPath, JSON.stringify(notifications, null, 2));

      res.status(200).json({ 
        success: true, 
        message: 'Notification removed successfully'
      });
    } catch (error) {
      console.error('Error removing notification:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to remove notification' 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

