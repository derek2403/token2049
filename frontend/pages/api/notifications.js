import clientPromise from '@/lib/mongodb';

/**
 * API endpoint to manage notifications using MongoDB
 * GET: Fetch latest notification for a specific wallet address
 * POST: Save new notifications
 * DELETE: Remove a notification by ID
 */
export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('leftai'); // Database name
    const notifications = db.collection('notifications'); // Collection name

    if (req.method === 'GET') {
      try {
        const { walletAddress } = req.query;

        if (!walletAddress) {
          return res.status(400).json({ 
            success: false, 
            error: 'walletAddress parameter required' 
          });
        }

        // Normalize wallet address (lowercase for comparison)
        const normalizedAddress = walletAddress.toLowerCase();
        
        // Fetch only the latest notification for this wallet address
        // Sort by createdAt descending, limit to 1
        const latestNotification = await notifications
          .find({ 
            $or: [
              { to: { $regex: new RegExp(`^${normalizedAddress}$`, 'i') } },
              { to: normalizedAddress }
            ]
          })
          .sort({ createdAt: -1 }) // Most recent first by creation date
          .limit(1)
          .toArray();

        console.log('Fetching notifications for:', walletAddress);
        console.log('Found:', latestNotification.length, 'notifications');

        res.status(200).json({ 
          success: true, 
          notification: latestNotification[0] || null,
          hasNotification: latestNotification.length > 0
        });
      } catch (error) {
        console.error('Error reading notifications:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to read notifications' 
        });
      }
    } else if (req.method === 'POST') {
      try {
        const newNotifications = req.body.notifications || [];
        
        if (newNotifications.length === 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'No notifications provided' 
          });
        }

        // Normalize wallet addresses to lowercase and add timestamps
        const notificationsWithTimestamp = newNotifications.map(notif => ({
          ...notif,
          to: notif.to?.toLowerCase(), // Normalize to lowercase
          from: notif.from?.toLowerCase(), // Normalize from as well
          timestamp: notif.timestamp || new Date().toISOString(),
          createdAt: new Date(),
        }));

        console.log('Saving notifications:', notificationsWithTimestamp.length);
        console.log('Recipients:', notificationsWithTimestamp.map(n => n.to));

        // Insert notifications into MongoDB
        const result = await notifications.insertMany(notificationsWithTimestamp);

        res.status(200).json({ 
          success: true, 
          message: 'Notifications saved successfully',
          count: result.insertedCount,
          ids: Object.values(result.insertedIds)
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
        const { notificationId } = req.body;

        if (!notificationId) {
          return res.status(400).json({ 
            success: false, 
            error: 'notificationId required' 
          });
        }

        // Remove notification by custom ID field
        const result = await notifications.deleteOne({ id: notificationId });

        res.status(200).json({ 
          success: true, 
          message: 'Notification removed successfully',
          deleted: result.deletedCount > 0
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
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed' 
    });
  }
}


